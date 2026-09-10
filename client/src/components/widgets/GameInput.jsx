import React, { useState } from 'react';
import { TextField } from "@mui/material";

/**
 * Text entry input
 *
 * @param {object} props
 * @returns
 */
const GameInput = (props) => {

	let newProps = {
		...props,
		size: props.size ? props.size : 'small',
		onChange: (event) => {
			const newVal = event.target.value;
			setValue(prevVal => newVal);
			props.onUpdate(newVal);
			event.preventDefault();
		}
	}

	delete newProps.initialValue;
	delete newProps.onUpdate;

	const [value, setValue] = useState(
		props.initialValue !== undefined ? props.initialValue : ''
	);

	return (
		<TextField
			value={value}
			{...newProps}
		/>
	)
}

export default GameInput;