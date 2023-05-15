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
 * Return if the number is a valid positive number
 * @param {number} num
 * @returns {boolean}
 */
export const isPositiveNumber = (num) => {
	return Number.isInteger(Number(num)) && Number(num) > 0;
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