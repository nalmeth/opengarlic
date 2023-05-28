import fs from 'node:fs/promises';

/**
 * Check if a file exists
 * @param {string} path
 * @returns
 */
export const fileExists = async path => !!(await fs.stat(path).catch(e => false));

/**
 * Return whether the string is empty
 * @param {string}
 */
export const isEmpty = (str) => !str || str.length === 0;

/**
 * Get a random number between min and max
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

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
 * Return if the number is a valid positive number
 * @param {number} num
 * @returns {boolean}
 */
export const isNumber = (num) => {
	return Number.isInteger(Number(num));
}

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
 * Returns a clone of an object
 * @param {object} obj
 * @returns {object}
 */
const clone = (obj) => {
	let cloneObj;
	try {
		cloneObj = JSON.parse(JSON.stringify(obj));
	} catch(err) {
		throw new Error('JSON parse error', err);
	}
	return cloneObj;
}

/**
 * Returns a deep merge of two objects
 * @param {object} target
 * @param {object} source
 * @returns
 */
export const mergeDeep = (target, source) => {
	target = clone(target);
	const isObject = (obj) => obj && typeof obj === 'object';

	if (!isObject(target) || !isObject(source)) return source;

	Object.keys(source).forEach(key => {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = targetValue.concat(sourceValue);

		} else if (isObject(targetValue) && isObject(sourceValue)) {
			target[key] = mergeDeep(
				Object.assign({}, targetValue),
				sourceValue
			);

		} else {
			target[key] = sourceValue;
		}
	});
	return target;
}