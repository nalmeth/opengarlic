import Konva from 'konva';
import fs from 'node:fs/promises';
import * as Frame from '../FrameFunctions.js'

/**
 * Create an image frame of a text prompt
 * for use in gif generation
 * @param {object} param0
 */
export const createFrame = async ({
		stageSize,
		slices,
		colors,
		frameData,
		savePath
	}) => {

	/**
	 * Create the stage
	 */
	const stage = new Konva.Stage({
		width: stageSize.width,
		height: stageSize.height
	});

	/**
	 * Layer we add shapes to
	 */
	const layer = new Konva.Layer();

	Frame.createBackground({
		stageSize,
		layer,
		slices,
		colors
	});

	Frame.createTextBubble({
		stageSize,
		position: {
			x: 100,
			y: 100
		},
		layer
	});

	const textData = new Konva.Text({
		x: 150,
		y: 200,
		text: frameData.value,
		fontSize: 40,
		fontStyle: 'bold',
		fontFamily: 'Roboto',
		fill: '#000',
		wrap: 'char',
		verticalAlign: 'middle',
		width: stageSize.width - 300,
	});
	layer.add(textData);

	Frame.createUserIcon({
		position: {
			x: 888,
			y: 523
		},
		layer
	});

	// Get username
	const username = frameData.name;

	const textWidth = Frame.getTextWidth(username, '30px Roboto');

	// Size username box according to size of username
	const boxStart = 200 + textWidth;
	const boxWidth = textWidth + 20;

	Frame.createUserNameBox({
		position: {
			x: stageSize.width - boxStart,
			y: stageSize.height - 100
		},
		width: boxWidth,
		height: 50,
		layer
	});

	// Username text
	const usernameText = new Konva.Text({
		x: stageSize.width - boxStart + 10,
		y: stageSize.height - 90,
		text: username,
		fontSize: 30,
		fontStyle: 'bold',
		fontFamily: 'Roboto',
		fill: '#000',
	});
	layer.add(usernameText);

	// Add our layer to the stage
	stage.add(layer);

	// Get a base64 png dataURL from the canvas
	const dataurl = await stage.toDataURL();

	// Transform into a Buffer
	const data = dataurl.split(',')[1];
	const dataBuffer = Buffer.from(data, "base64");

	// Write Buffer to a file
	await fs.writeFile(savePath, dataBuffer);
}