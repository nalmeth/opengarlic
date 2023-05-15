import React, { useState } from "react";
import { Grid } from "@mui/material";
import { DrawingTools } from "./DrawingTools";
import DrawingBoard from "./DrawingBoard";
import DrawingSidePanel from './DrawingSidePanel';

/**
 * Container for DrawingBoard and DrawingTools
 * props:
 * 		onChange		- Callback for data changing
 * 		showTools		- Flag for showing drawing tools
 * 		displayShapes	- Array of shape data to display
 *
 * @param {object} props
 * @returns
 */
const DrawingArea = (props) => {

	// Default Tools object
	const defaultTools = {
		brushColor: "#000",
		bgColor: "#FFF",
		opacity: 1,
		strokeWidth: 5,
		lineCap: "round",
		tension: 0.5,
		tool: DrawingTools.Brush
	};

	// Tool settings state
	const [toolSettings, setToolSettings] = useState(defaultTools);
	// Reset Tools to default
	const resetTools = () => setToolSettings(defaultTools);

	// const isSmall = useMediaQuery(theme => theme.breakpoints.down('xl'));
	// const isXL = useMediaQuery(theme => theme.breakpoints.only('xl'));
	// const isLg = useMediaQuery(theme => theme.breakpoints.only('lg'));
	// const isMd = useMediaQuery(theme => theme.breakpoints.only('md'));
	// const isSm = useMediaQuery(theme => theme.breakpoints.only('sm'));
	// const isXS = useMediaQuery(theme => theme.breakpoints.only('xs'));
	// console.log('isXL', isXL, 'isLg', isLg, 'isMd', isMd, 'isSm', isSm, 'isXS', isXS)
	// console.log('isSmall', isSmall)

	/**
	 * Update the Tool settings in state
	 * @param {string} setting
	 * @param {any} value
	 */
	const setTool = (setting, value) => {
		setToolSettings(prevState => ({
			...prevState,
			[setting]: value
		}));
	}

	return (
		<Grid
			container
			direction="row"
			justifyContent="center"
			alignItems="stretch"
			gap={2}
		>
			{props.showTools &&
			<DrawingSidePanel
				toolSettings={toolSettings}
				setTool={setTool}
				resetTools={resetTools}
			/>
			}

			<Grid
				key="drawingContainer"
				sx={{ cursor: `${toolSettings.tool.cursor}` }}
			>
				<DrawingBoard
					{...toolSettings}
					stageRef={props.stageRef}
					onChange={props.onChange}
					displayShapes={props.displayShapes}
					lockBoard={props.lockBoard}
					MAX_WIDTH={props.MAX_WIDTH}
					MAX_HEIGHT={props.MAX_HEIGHT}
				/>
			</Grid>

		</Grid>
	)
}

export default DrawingArea;