/**
 * Trim a character form both ends of a string
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trim = (str, char) => {
	let start = 0;
	let end = str.length;

	while(start < end && str[start] === char) ++start;
	while(end > start && str[end - 1] === char) --end;

	return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

/**
 * Wrap text at a line length
 * @param {string} text
 * @param {number} maxLength
 * @returns
 */
export const wordWrap = (text, maxLength) => {
	let wrappedText = text;
	if(text.length > maxLength) {
		let segments = [];
		let splitText = text.split('');
		while(splitText.length > 0) {
			segments.push(splitText.splice(0, maxLength).join(''));
		}
		wrappedText = segments.join('\n');
	}
	return wrappedText;
}

/**
 * Return if the number is a valid positive number
 * @param {number} num
 * @returns {boolean}
 */
export const isNumber = (num) => {
	return Number.isInteger(Number(num));
}


/**
 * Check if value is true.
 * (For strings 'true' is true, 'false' is false)
 * @param {mixed} input
 * @returns {boolean}
 */
export const isTrue = (input) => {
	if(typeof input === 'string') {
		return input.toLowerCase() === 'true';
	}

	return !!input;
}

/**
 * Round to two decimal points
 * @param {number} num
 */
export const round2 = (num) => Math.round(num * 100) / 100;

/**
 * Used to throttle function calls for performance
 * @param {function} fn Function to call
 * @param {number} ms Milliseconds
 * @returns {function}
 */
export const debounce = (fn, ms) => {
	let timer;
	return function() {
		const self = this;
		const args = arguments;
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(self, args), ms);
	}
}

/**
	 * Returns true if the click event was within the bounds of a
	 * square (NOT including the stroke)
	 * @param {object} event
	 * @param {object} shape
	 * @param {number} scale stage scale
	 * @returns {boolean}
	 */
export const isInsideRect = (event, shape, scale) => {
	const points = shape.points;

	// 1/2 the stroke width overlaps the square, so we
	// Use a 'virtual' smaller square to detect inside the visual box
	const sw = Math.ceil(shape.strokeWidth/2);

	// top-left and bottom-right x coord
	const [leftx, rightx] = points[0] < points[2] ?
			[points[0]+sw, points[2]-sw] : [points[2]+sw, points[0]-sw];

	// top-left and bottom-right y coord
	const [lefty, righty] = points[1] < points[3] ?
			[points[1]+sw, points[3]-sw] : [points[3]+sw, points[1]-sw];

	// Account for scale
	const [scaledLX, scaledLY, scaledRX, scaledRY] =
			[leftx,lefty,rightx,righty].map(coord => coord * scale);

	// Check if the click was within the bounds
	return (scaledLX <= event.offsetX && scaledLY <= event.offsetY) &&
			(scaledRX >= event.offsetX && scaledRY >= event.offsetY);
}

/**
	 * Returns true if the click event was within the bounds of a
	 * square (Including the stroke)
	 * @param {object} event
	 * @param {object} shape
	 * @param {number} scale stage scale
	 * @returns {boolean}
	 */
export const isInsideRectStroke = (event, shape, scale) => {
	const points = shape.points;
	// Add stroke to size for comparision to see
	// if it fits with the stroke included
	const sw = Math.ceil(shape.strokeWidth/2);
	// top-left and bottom-right x coord
	const [leftx, rightx] = points[0] < points[2] ?
			[points[0]-sw, points[2]+sw] : [points[2]-sw, points[0]+sw];

	// top-left and bottom-right y coord
	const [lefty, righty] = points[1] < points[3] ?
			[points[1]-sw, points[3]+sw] : [points[3]-sw, points[1]+sw];

			// Account for scale
	const [scaledLX, scaledLY, scaledRX, scaledRY] =
			[leftx,lefty,rightx,righty].map(coord => coord * scale);

	// Check if the click was within the bounds
	return (scaledLX <= event.offsetX && scaledLY <= event.offsetY) &&
			(scaledRX >= event.offsetX && scaledRY >= event.offsetY);
}

/**
	 * Return true if the click event was withing the bounds of a
	 * circle (NOT including the stroke)
	 * @param {object} event
	 * @param {object} shape
	 * @param {number} scale stage scale
	 * @returns {boolean}
	 */
export const isInsideCircle = (event, shape, scale) => {
	const sw = Math.ceil(shape.strokeWidth/2);
	const cx = shape.points[0] * scale;
	const cy = shape.points[1] * scale;
	const r = (shape.radius-sw) * scale;
	const x = event.offsetX;
	const y = event.offsetY;
	// Calculates if a point is inside a circle given the circle center point and radius
	return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
}

/**
	 * Returns true if the click event was within the bounds of a
	 * circle (Including the stroke)
	 * @param {object} event
	 * @param {object} shape
	 * @param {number} scale stage scale
	 * @returns {boolean}
	 */
export const isInsideCircleStroke = (event, shape, scale) => {
	const sw = Math.ceil(shape.strokeWidth/2);
	const cx = shape.points[0] * scale;
	const cy = shape.points[1] * scale;
	const r = (shape.radius+sw) * scale;
	const x = event.offsetX;
	const y = event.offsetY;
	// Calculates if a point is inside a circle given the circle center point and radius
	return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
}