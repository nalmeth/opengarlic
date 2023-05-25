import fs from 'node:fs/promises';
import * as TextFrame from '../TextFrame.js';
import * as ImageFrame from '../ImageFrame.js';
import * as Lobby from '../Lobby.js';
import Logger from "../Logger.js";
import { customAlphabet } from "nanoid";


// const testData = JSON.parse(
// 	await fs.readFile('./modules/data.json')
// );

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

/**
 * Color Palette
 */
const colors = [
	'#ffbe0b',
	'#ff006e',
	'#fb5607',
	'#8338ec',
	'#3a86ff'
];

/**
 * Slice of image in which to generate background shapes.
 * This is done to prevent clustering.
 */
const slices = [
	{ startX: 10, endX: 200, startY: 10, endY: 300 },
	{ startX: 210, endX: 400, startY: 10, endY: 300	},
	{ startX: 410, endX: 600, startY: 10, endY: 300	},
	{ startX: 610, endX: 800, startY: 10, endY: 300	},
	{ startX: 810, endX: 990, startY: 10, endY: 300	},
	{ startX: 10, endX: 200, startY: 310, endY: 590	},
	{ startX: 210, endX: 400, startY: 310, endY: 590 },
	{ startX: 410, endX: 600, startY: 310, endY: 590 },
	{ startX: 610, endX: 800, startY: 310, endY: 590 },
	{ startX: 810, endX: 990, startY: 310, endY: 590 }
];

/**
 * Size of our stage
 */
const stageSize = Object.freeze({
	width: 1000,
	height: 600
});

/**
 * Generate a gif of a Standard mode lobby
 * @param {string} lobbyData
 * @param {string} playerName
 */
export const generateGIF = async (lobbyCode, playerName) => {

	const lobbyData = await Lobby.getLobbyData(lobbyCode);

	if(!lobbyData) {
		Logger.info(`Error generating GIF for lobby: ${lobbyCode}`);
		return;
	}

	for(const player in lobbyData) {
		if(player === playerName) {

			let frameData = {};
			for(let i = 0; i < lobbyData[player].length; i++) {

				frameData = lobbyData[player][i];
				if(i % 2 === 0) {

					await TextFrame.createFrame({
						stageSize,
						slices,
						colors,
						frameData,
						savePath: `G:\\${lobbyCode}:frame:${i}.png`
					});

				} else {

					await ImageFrame.createFrame({
						stageSize,
						slices,
						colors,
						frameData,
						savePath: `G:\\${lobbyCode}:frame:${i}.png`,
						tmpPath: `G:\\${lobbyCode}:tmpFrame:${nanoid()}.png`
					});

				}
			}

			break;
		}
	}
}

generateGIF(testData, "chrome");