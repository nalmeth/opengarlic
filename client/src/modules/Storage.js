import { useState, useEffect } from 'react';

/**
 * Attempt to read a state value from localStorage
 * or else return the default value
 *
 * @param {string} key State key
 * @param {mixed} defaultValue Default State Value
 * @returns {mixed}
 */
const getStorageValue = (key, defaultValue) => {

	let value;
	try {
		const saved = localStorage.getItem(key);
		value = JSON.parse(saved);

	} catch(err) {
		// console.error(err);
		value = false;
	}

	return value || defaultValue;
}

/**
 * CAREFUL - This should only be used if the corresponding
 * state variable becomes irrelevant (ie. on unmount)
 * @param {string} key
 * @returns {boolean}
 */
export const removeStorageValue = (key) => {
	let success = true;
	try {
		localStorage.removeItem(key);
	} catch(err) {
		success = false;
	}
	return success;
}

/**
 * Wrapper for React.useState, the automates pushing
 * state to localStorage so we can restore on refreshes
 *
 * @param {string} key State key
 * @param {mixed} defaultValue Default State Value
 * @returns {Array} State variable, and Setter function from useState
 */
export const useLocalStorage = (key, defaultValue) => {

	const [value, setValue] = useState(() => {
		return getStorageValue(key, defaultValue);
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}

/**
 * Clear the localStorage
 */
export const clear = () => {
	localStorage.clear();
}