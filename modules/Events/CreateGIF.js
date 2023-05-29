import * as Lobby from '../Lobby.js';
import Logger from "../Logger.js";
import FrameMakers from '../FrameMakers.js';
import fs from 'node:fs/promises';
import { fileExists } from "../Helpers.js";
import { spawn } from "node:child_process";

/**
 * Create GIF Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const CreateGIF = async (io, socket, data) => {
	Logger.info(`Making GIF ${data.lobbyCode}`);

	try {

		const lobby = await Lobby.get(data.lobbyCode);

		if(lobby === null) {
			socket.emit('error', {
				type: 'CreateGIF',
				message: `Invalid lobby ${data.lobbyCode}`
			});
		}

		const maker = FrameMakers[lobby.mode];

		if(!maker) {
			Logger.info(`Invalid GIF Maker ${lobby.mode}`);
			socket.emit('error', {
				type: 'CreateGIF',
				message: `Invalid GIF Maker ${lobby.mode}`
			});
			return;
		}

		const SAVE_PATH = (() => {
			let newPath = process.env.GIF_SAVE_PATH;
			if(newPath.endsWith('/')) newPath = newPath.slice(0,-1);
			if(newPath.endsWith('\\')) newPath = newPath.slice(0,-1);
			return newPath;
		})();

		const GIFDIR = `${SAVE_PATH}/${data.lobbyCode}`;
		const GIFNAME = `${data.playerName}.gif`;

		// Check if the gif already exists
		if(await fileExists(`${GIFDIR}/${GIFNAME}`)) {
			const gifFile = (await fs.readFile(`${GIFDIR}/${GIFNAME}`, 'base64')).toString('image/gif');
			const dataURL = `data:image/gif;base64,${gifFile}`;
			socket.emit('GIFCreated', dataURL, GIFNAME);
			return false;
		}

		// Attempt to create output directory
		await fs.mkdir(GIFDIR, { recursive: true}, err => {
			if(!err) console.log('Directory created or already exists');
			switch(err.code) {
				case 'EEXIST': //Exists but isn't directory
				case 'ENOTDIR': //Parent dir contains file by the name to be created
				default:
					console.error(err);
					break;
			}
		});

		console.log('Generate Frames');

		await maker.generateFrames(data.lobbyCode, data.playerName, GIFDIR);

		/**
		 * Create the actual gif from the frames
		 */
		let gifArgs = [
			`--fps`, `1`,
			`-o`, `${GIFDIR}/${GIFNAME}`,
		];

		// Get list of frames
		let frames = await fs.readdir(`${GIFDIR}`);
		frames = frames.filter(frame => frame.startsWith(data.playerName));
		gifArgs = gifArgs.concat(frames);

		console.log('Generate GIF');

		const gifski = spawn(`${process.env.GIFSKI_PATH}`, gifArgs, {
			cwd: GIFDIR, timeout: 10000
		});

		gifski.stdout.on('data', data => console.log(`SKI DATA ${data}`));

		gifski.stderr.on('data', data => console.error(`SKI ERROR: ${data}`));

		gifski.on('close', async code => {
			const gifFile = (await fs.readFile(`${GIFDIR}/${GIFNAME}`, 'base64')).toString('image/gif');
			const dataURL = `data:image/gif;base64,${gifFile}`;
			socket.emit('GIFCreated', dataURL, GIFNAME);
		});

	} catch(err) {
		socket.emit('error', {
			type: 'CreateGIF',
			message: 'Error generating GIF'
		});
	}
}

export default CreateGIF;