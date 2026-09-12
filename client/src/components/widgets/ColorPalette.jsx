import React, { useState, useRef, useEffect } from "react";
import Grid from '@mui/material/Grid';
import {
	Button,
	Box,
	ClickAwayListener,
	Popper,
	TextField
} from '@mui/material';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';

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
	const [popColor, setPopColor] = useColor("#FFF");
	// Local buffer for the custom hex input (replaces the library's own
	// built-in hex field, which doesn't correctly parse typed values).
	// Kept separate from popColor so the user can type freely without each
	// keystroke needing to already be a valid, complete hex color.
	const [hexInputValue, setHexInputValue] = useState(popColor.hex);
	const [hexInputError, setHexInputError] = useState(false);
	// Color picker open state
	const [open, setOpen] = useState(!!popAnchor);
	// Color palette state
	const [colorPalette, setColorPalette] = useState([
		'#000', '#FFF', '#F00', '#0F0', '#00F',
		'#fcea01', '#11491d', '#114749', '#231149',
		'#491145', '#491119'
	]);

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
			setPopColor(prevColor => colorPalette[paletteIdx]);
		}

		const newAnchor = popAnchor ? null : event.currentTarget;

		// Toggle open and popAnchor states
		setOpen(prevOpen => popAnchor ? false : true);
		setPopAnchor(prevAnchor => newAnchor);
	}

	// Keep the custom hex field in sync when the color changes via the
	// visual picker (dragging the saturation/hue square).
	useEffect(() => {
		setHexInputValue(popColor.hex);
		setHexInputError(false);
	}, [popColor.hex]);

	/**
	 * Validate and commit the custom hex input's value. Uses the same
	 * setPopColor(rawString) path already confirmed to work when dragging
	 * the visual picker, rather than the library's own built-in hex field.
	 */
	const commitHexInput = () => {
		const isValid = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hexInputValue);
		if(isValid) {
			const normalized = hexInputValue.startsWith('#') ? hexInputValue : `#${hexInputValue}`;
			setPopColor(prevColor => normalized);
			setHexInputError(false);
		} else {
			setHexInputError(true);
		}
	}

	/**
	 * Color save handler. Reads directly from popColor - the ColorPicker's
	 * own controlled state - rather than a separately-staged ref, so there's
	 * no synchronization gap that could ever leave it unset.
	 */
	const handleSaveColor = () => {

		if(isNewColor.current) {

			// Add new color to palette
			setColorPalette(prevPalette => [
				...colorPalette,
				popColor.hex
			]);

		} else {

			// Change pre-existing color in palette
			setColorPalette(prevPalette => {
				return prevPalette.map((color, idx) => {
					if(idx === pIdx.current) return popColor.hex;
					return color;
				});
			});
		}

		// Close color picker and cleanup refs
		setColor(popColor.hex);
		setOpen(prevOpen => false);
		setPopAnchor(prevAnchor => null);
		isNewColor.current = false;
	}

	// Part of MUI example. Not sure why this needs toggling
	const popid = open ? 'simple-popper' : undefined;

	return (
		<Grid container
			direction="row"
			spacing={.5}
			columns={4}
			sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
		>
			{colorPalette.map((item, idx) => {
				return (
					<Grid size={1} key={idx}>
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
			<Grid size="grow" key="newPaletteColor">
				<Button
					variant="outlined"
					aria-describedby={popid}
					type="button"
					onClick={(e)=>handlePaletteClick(e, 'new')}
				>+</Button>
			</Grid>

			{open &&
			<ClickAwayListener onClickAway={()=> {
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
						onChange={pickedColor => setPopColor(prevColor => pickedColor)}
						alpha={true}
						dark
						hideHEX
						hideHSV
						hideRGB
					/>
					<TextField
						size="small"
						label="Hex"
						value={hexInputValue}
						error={hexInputError}
						helperText={hexInputError ? 'Invalid hex color' : ' '}
						onChange={e => setHexInputValue(e.target.value)}
						onBlur={commitHexInput}
						onKeyDown={e => {
							if(e.key === 'Enter') {
								commitHexInput();
								e.preventDefault();
							}
						}}
						sx={{ mt: 1, width: '100%' }}
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