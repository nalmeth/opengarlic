import React, { useState, useRef } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Button,
	Box,
	ClickAwayListener,
	Popper
} from '@mui/material';
import { ColorPicker, useColor, toColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';

/**
 * Color Palette Component
 *
 * @prop {function} setColor Callback to receive colors
 * @returns {JSX.Element}
 */
const ColorPalette = ({ setColor }) => {
	// Color Picker Anchor element state
	const [popAnchor, setPopAnchor] = useState(null);
	// Color Picker initial color state
	const [popColor, setPopColor] = useColor("hex", "#FFF");
	// Color picker open state
	const [open, setOpen] = useState(!!popAnchor);
	// Color palette state
	const [colorPalette, setColorPalette] = useState([
		'#000', '#FFF', '#F00', '#0F0', '#00F',
		'#fcea01', '#11491d', '#114749', '#231149',
		'#491145', '#491119'
	]);

	// Storage for new color before saving it to palette
	const newColor = useRef(null);
	const isNewColor = useRef(false);
	// Tracking active color for changing color button display
	const color = useRef("#000");
	// Track index of palette color clicked
	const pIdx = useRef(null);

	/**
	 * Fires when a palette button is clicked
	 * @param {MouseEvent} event
	 */
	 const handlePaletteClick = (event, paletteIdx) => {
		/**
		 * Index of palette item clicked, which corresponds
		 * with the index in the colorPalette state
		 */
		// const paletteIdx = event.target.id.split('.')[1];

		// Update flag for renderer to toggle save button for new colors
		isNewColor.current = paletteIdx === 'new';
		if(newColor.current === null) newColor.current = popColor;
		pIdx.current = paletteIdx;

		/**
		 * If we are not holding control key and we didn't click on the
		 * new palette color button, then set active color
		 */
		if(!event.ctrlKey && paletteIdx !== 'new') {
			color.current = colorPalette[paletteIdx];
			setColor(colorPalette[paletteIdx]);
			return;
		}

		// Set initial color state equal to color of palette button clicked
		if(!popAnchor && paletteIdx !== 'new') {
			setPopColor(prevColor => toColor('hex', colorPalette[paletteIdx]));
		}

		const newAnchor = popAnchor ? null : event.currentTarget;

		// Toggle open and popAnchor states
		setOpen(prevOpen => popAnchor ? false : true);
		setPopAnchor(prevAnchor => newAnchor);
	}

	/**
	 * Fires when the color in the picker has changed
	 * @param {object} pickedColor
	 */
	const handleColorComplete = (pickedColor) => {
		/**
		 * Store new color in ref.
		 * We add this to the palette only after manual save,
		 * so that we don't add a new color until they're done adjusting it.
		 */
		newColor.current = pickedColor;
		color.current = pickedColor.hex;
	}

	/**
	 * Color save handler
	 */
	const handleSaveColor = () => {

		if(isNewColor.current) {

			// Add new color to palette
			setColorPalette(prevPalette => [
				...colorPalette,
				newColor.current.hex
			]);

		} else {

			// Change pre-existing color in palette
			setColorPalette(prevPalette => {
				return prevPalette.map((color, idx) => {
					if(idx === pIdx.current) return newColor.current.hex;
					return color;
				});
			});
		}

		// Close color picker and cleanup refs
		setColor(newColor.current.hex);
		setOpen(prevOpen => false);
		setPopAnchor(prevAnchor => null);
		newColor.current = null;
		isNewColor.current = false;
	}

	// Part of MUI example. Not sure why this needs toggling
	const popid = open ? 'simple-popper' : undefined;

	return (
		<Grid container
			direction="row"
			justifyContent="flex-start"
			alignItems="flex-start"
			spacing={.5}
			columns={4}
		>
			{colorPalette.map((item, idx) => {
				return (
					<Grid xs={1} key={idx}>
						<Button
							key={idx}
							variant={'outlined'}
							sx={{
								backgroundColor: colorPalette[idx],
								"&.MuiButtonBase-root:hover" : {
									bgcolor: colorPalette[idx]
								},
								borderRadius: color.current === colorPalette[idx] ? 3 : 1,
								borderColor: color.current === colorPalette[idx] ?
												'#42a5f5' : colorPalette[idx],
								boxShadow: color.current === colorPalette[idx] ?
												'inset 0 0 5px #42a5f5' : 'none',
								transition: 'border-radius .25s'
							}}
							aria-describedby={popid}
							type="button"
							onClick={(e)=>handlePaletteClick(e, idx)}
						>&nbsp;</Button>
					</Grid>
				)
			})}
			<Grid xs key="newPaletteColor">
				<Button
					variant="outlined"
					aria-describedby={popid}
					type="button"
					onClick={(e)=>handlePaletteClick(e, 'new')}
				>+</Button>
			</Grid>

			{open &&
			<ClickAwayListener onClickAway={()=> {
				newColor.current = null;
				isNewColor.current = false;
				setOpen(prevOpen => false);
				setPopAnchor(prevAnchor => null);
			}}>
				<Popper
					id={popid}
					open={open}
					anchorEl={popAnchor}
					placement="right-start"
					sx={{
						backgroundColor: '#181818',
						borderRadius: '10px'
					}}
				>
					<ColorPicker
						width={250}
						height={200}
						color={popColor}
						onChange={newColor => setPopColor(prevColor => newColor)}
						onChangeComplete={handleColorComplete}
						alpha={true}
						dark
						hideHSV
						hideRGB
					/>
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Button type="button" onClick={handleSaveColor}>Save</Button>
					</Box>
				</Popper>
			</ClickAwayListener>
			}
		</Grid>

	)
}

export default React.memo(ColorPalette);