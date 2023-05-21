import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from "@mui/material";
import React from 'react';
import DrawingArea from "../widgets/DrawingArea";
import GameNumericInput from "../widgets/GameNumericInput.js";

/**
 * Slice 3 Game Mode
 *
 * Game mode that's intended to be where canvas is 'sliced' in thirds.
 * Each person draws the top/middle/bottom as it rotates around. Combine
 * the drawings at the end.
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
const Slice3 = (props) => {
	return (
		<>
		<Typography>Slice3</Typography>
		<Grid
			container
			direction={props.gameScreen % 2 === 0 ? "row" : "column"}
			justifyContent="center"
			alignItems="stretch"
			spacing={2}
		>
			<Grid>
				<DrawingArea
					onChange={props.onChange}
					showTools={true}
					displayShapes={[]}
				/>
			</Grid>
		</Grid>
		</>
	)
}

export default Slice3;

export const title = 'Slice3';
export const description = 'Players get one of three slices to draw. At the end they are combined.';
export const settings = [
	{
		name: 'testSetting',
		displayName: 'Test Setting',
		default: 'testing',
		component: () => <Typography>Testing</Typography>
	},
	{
		name: 'maxPlayers',
		displayName: 'Max Players',
		default: 15,
		component: (newProps) => {
			let props = {
				initialValue: 15,
				minValue: 0,
				maxValue: 15,
				required: true
			};
			props = {...props, ...newProps};
			return <GameNumericInput {...props} />
		}
	},
	{
		name: 'groupSize',
		displayName: 'Group Size',
		default: 3,
		component: () => <Typography>3</Typography>
	},
	{
		name: 'timer',
		displayName: 'Timer',
		default: 0,
		component: (newProps) => {
			let props = {
				initialValue: 0,
				minValue: 0,
				required: true
			};
			props = {...props, ...newProps};
			return <GameNumericInput {...props} />
		}
	}
];