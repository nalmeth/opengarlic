import React, { useRef } from 'react';
import { Typography } from "@mui/material";

/**
 * Dev Use
 * Render Counter Component
 * props:
 * 		None at the moment
 * 		
 * @param {object} props 
 * @returns {JSX.Element}
 */
 const RenderCounter = (props) => {
	const renderCounter = useRef(0);
	renderCounter.current = renderCounter.current + 1;
	return (
		<Typography component="span" sx={{
			position: "fixed",
			bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)'
		}}>
			(Renders: {renderCounter.current})
		</Typography>
	)
}

export default RenderCounter;