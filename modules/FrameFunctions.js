import Konva from 'konva';
import { Canvas } from "canvas";

/**
 * Generate background shapes randomly in a given slice
 * @param {object} slice startX,startY,endX,endY
 * @param {array} starColors Hex colors for the stars
 * @param {Konva.Layer} layer Layer on which to draw
 */
const createStars = (slice, starColors, layer) => {

	const endIdx = starColors.length - 1;

	const star = new Konva.Star({
		x: rand(slice.startX, slice.endX),
		y: rand(slice.startY, slice.endY),
		numPoints: 4,
		innerRadius: 5,
		outerRadius: 10,
		fill: starColors[rand(0,endIdx)],
		stroke: '#000',
		strokeWidth: 2
	});

	const star2 = new Konva.Star({
		x: rand(slice.startX, slice.endX),
		y: rand(slice.startY, slice.endY),
		numPoints: 8,
		innerRadius: 5,
		outerRadius: 10,
		fill: starColors[rand(0,endIdx)],
		stroke: '#000',
		strokeWidth: 2
	});

	layer.add(star);
	layer.add(star2);
}

/**
 * Create a background with random stars on it
 * @param {object} param0
 */
export const createBackground = ({
		stageSize,
		layer,
		slices,
		colors
	}) => {
	/**
	 * Background rect
	 */
	const bgColorIdx = rand(0, colors.length - 1);
	const background = new Konva.Rect({
		x: 0, y: 0,
		width: stageSize.width,
		height: stageSize.height,
		fill: colors[bgColorIdx],
		cornerRadius: 10
	});

	layer.add(background);

	// Array of remaining colors without the background color
	const starColors = colors.toSpliced(bgColorIdx, 1);

	// Generate 5 of each star randomly in each slice
	for(const slice of slices) {
		for(let i = 0; i <= 5; i++) {
			createStars(slice, starColors, layer);
		}
	}
}

/**
 * Create a text bubble for displaying text data
 * @param {object} param0
 */
export const createTextBubble = ({
		stageSize,
		position,
		layer
	}) => {

	// Draw the white text background rect
	const textRect = new Konva.Rect({
		x: position.x,
		y: position.y,
		width: stageSize.width - 200,
		height: stageSize.height - 250,
		fill: '#fff',
		cornerRadius: 10,
		shadowBlur: 10
	});

	layer.add(textRect);

	// Pointy bit on the chat bubble
	const speechHandle = new Konva.Line({
		points: [
			stageSize.width - 200, stageSize.height - 150,
			stageSize.width - 140, stageSize.height - 125,
			stageSize.width - 150, stageSize.height - 150
		],
		lineCap: "round",
		lineJoin: "round",
		fill: '#fff',
		stroke: '#ffffff',
		strokeWidth: 1,
		closed: true,
		shadowBlur: 5,
		shadowOpacity: .50,
		shadowOffsetY: 7
	});

	layer.add(speechHandle);
}

/**
 * Create the user icon
 * @param {object} param0
 */
export const createUserIcon = ({
		position,
		layer
	}) => {

	// Background for circle user icon
	const circleUserBg = new Konva.Circle({
		x: position.x,
		y: position.y,
		radius: 33,
		fill: '#fff',
		stroke: '#fff',
		strokeWidth: 1
	});
	layer.add(circleUserBg);

	// Circle User Icon from FontAwesome
	const circleUser = new Konva.Path({
		x: position.x - 38,
		y: position.y - 38,
		data: "M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z",
		fill: '#212121',
		scaleX: .15,
		scaleY: .15
	});
	layer.add(circleUser);
}

/**
 * Get the pixel width of a set text given the font
 * @param {string} text Text to size
 * @param {string} font Pixel/Font settings (ie. '12px sans-serif')
 * @returns {number}
 */
export const getTextWidth = (text, font) => {
	// Calculate width of username
	const canvas = new Canvas(500,500);
	const ctx = canvas.getContext('2d');
	ctx.font = font;
	return ctx.measureText(text).width;
}

/**
 * Get a random number between min and max
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Create the box for a username
 * @param {object} param0
 */
export const createUserNameBox = ({
		position,
		width,
		height,
		layer
	}) => {

	// Rect containing user name
	const nameBox = new Konva.Rect({
		x: position.x,
		y: position.y,
		width,
		height,
		fill: '#fff',
		stroke: '#000',
		strokeWidth: 3,
		cornerRadius: 10,
		shadowBlur: 5
	});
	layer.add(nameBox);
}