import Konva from 'konva';
import fs from 'node:fs/promises';
import * as Frame from './FrameFunctions.js';

/**
 * Create a image frame of image data
 * for user in gif generation
 * @param {object} param0
 */
export const createFrame = async({
		stageSize,
		slices,
		colors,
		frameData,
		savePath,
		tmpPath
	}) => {

	/**
	 * Screen2
	 */
	const stage = new Konva.Stage({
		width: stageSize.width,
		height: stageSize.height
	});

	const layer = new Konva.Layer();

	Frame.createBackground({
		stageSize,
		layer,
		slices,
		colors
	});

	const imgDataUrl = frameData.value;
	const tmpImgData = imgDataUrl.split(',')[1];
	const tmpImgBuffer = Buffer.from(tmpImgData, "base64");
	await fs.writeFile(tmpPath, tmpImgBuffer);

	Konva.Image.fromURL(tmpPath, img => {
		img.setAttrs({
			x: 100, y: 20,
			scaleX: .8,
			scaleY: .8,
			cornerRadius: 10
		});
		layer.add(img);
	});

	Frame.createUserIcon({
		position: {
			x: 888,
			y: stageSize.height - 50
		},
		layer
	});

	const textWidth = Frame.getTextWidth(frameData.name, '30px Roboto');

	// Size username box according to size of username
	const boxStart = 200 + textWidth;
	const boxWidth = textWidth + 20;

	Frame.createUserNameBox({
		position: {
			x: stageSize.width - boxStart,
			y: stageSize.height - 75
		},
		width: boxWidth,
		height: 50,
		layer
	});

	// Username text
	const username = new Konva.Text({
		x: stageSize.width - boxStart + 10,
		y: stageSize.height - 65,
		text: frameData.name,
		fontSize: 30,
		fontStyle: 'bold',
		fontFamily: 'Roboto',
		fill: '#000',
	});
	layer.add(username);

	stage.add(layer);

	const stageDataUrl = stage.toDataURL();
	const newImgDataUrl = stageDataUrl.split(',')[1];
	const newImgDataBuff = Buffer.from(newImgDataUrl, "base64");

	await fs.writeFile(savePath, newImgDataBuff);
	await fs.rm(tmpPath, { force: true });
}