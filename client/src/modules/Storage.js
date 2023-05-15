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
 * Just in case you want to use it this way for consistency
 * and not having random raw calls to localStorage
 *
 * We shouldn't need: removeitem, key, or length
 * as we don't want to be editing localStorage directly.
 * Instead we want state updates to push updates to localStorage,
 * so the source of truth remains the application state.
 *
 * clear is ok, because localStorage keys will be recreated
 */

/**
 * Clear the localStorage
 */
export const clear = () => {
	localStorage.clear();
}