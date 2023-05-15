import React from 'react';
import { TextField } from "@mui/material";

/**
 * Text entry input
 * props:
 * 		size			- Input size
 * 		onChange		- Callback for data change
 *
 * @param {object} props
 * @returns
 */
const GameInput = (props) => {

	const inputProps = {...props};
	inputProps.size = props.size || "small";
	inputProps.onChange = event => props.onChange(event.currentTarget.value);

	return (
		<TextField {...inputProps} />
	)
}

export default GameInput;