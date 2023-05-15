import { Typography } from "@mui/material";
import React from "react";

/**
 * Displays drawing prompt
 *
 * @prop {string} displayText Text to display
 * @returns {JSX.Element}
 */
const GameText = ({ displayText }) => {

	displayText = typeof displayText !== 'string' ? '' : displayText;

	return (
		<Typography>{displayText}</Typography>
	)
}

export default GameText;