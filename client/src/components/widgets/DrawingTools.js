import React from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	IconButton,
	Slider,
	Tooltip,
	Typography,
	useMediaQuery
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
	faEraser as EraserIcon, faPaintBrush as BrushIcon,
	faFillDrip as FillIcon, //faDrawPolygon as PolygonIcon,
	faSquareFull as RectFilledIcon, faCircle as CircleFilledIcon
} from '@fortawesome/free-solid-svg-icons';
import {
	faSquareFull as RectIcon, faCircle as CircleIcon
} from '@fortawesome/free-regular-svg-icons';

/**
 * Tool definitions
 */
export const DrawingTools = Object.freeze({
	Brush: {
		name: 'brush',
		icon: BrushIcon,
		cursor: 'crosshair',
		tip: 'Paint Brush'
	},
	Line: {
		name: 'line',
		icon: 'i-linetool',
		description: "Draw a Line",
		cursor: 'crosshair',
		tip: 'Line Tool'
	},
	Eraser: {
		name: 'eraser',
		icon: EraserIcon,
		cursor: 'crosshair',
		tip: 'Eraser'
	},
	Fill: {
		name: 'fill',
		icon: FillIcon,
		cursor: 'crosshair',
		tip: 'Paint Fill'
	},
	Rect: {
		name: 'rect',
		icon: RectIcon,
		cursor: 'crosshair',
		tip: 'Rect'
	},
	RectFilled: {
		name: 'rectfilled',
		icon: RectFilledIcon,
		cursor: 'crosshair',
		tip: 'Filled Rectangle'
	},
	Circle: {
		name: 'circle',
		icon: CircleIcon,
		cursor: 'crosshair',
		tip: 'Circle'
	},
	CircleFilled: {
		name: 'circlefilled',
		icon: CircleFilledIcon,
		cursor: 'crosshair',
		tip: 'Filled Circle'
	},
	// TODO - Code this feature
	// Polygon: {
	// 	name: 'polygon',
	// 	icon: PolygonIcon,
	// 	cursor: 'crosshair'
	// }
});

/**
 * Drawing Tool Panel Component
 *
 * @prop {string} activeTool Name of active tool
 * @prop {function} onButtonClick Handler for when tool button is clicked
 * @returns {JSX.Element}
 */
const DrawToolPanel = ({
		activeTool,
		onButtonClick,
		setTool
	}) => {

	const isSmall = useMediaQuery(theme => theme.breakpoints.down('xl'));

	return (
		<>
		<Grid container
			direction="row"
			justifyContent="flex-start"
			alignItems="flex-start"
			spacing={0.5}
		>
			{Object.keys(DrawingTools).map(key => {
				return (
					<DrawToolButton
						key={DrawingTools[key].name}
						active={activeTool === DrawingTools[key].name}
						name={DrawingTools[key].name}
						icon={DrawingTools[key].icon}
						handleClick={() => setTool('tool', DrawingTools[key])}
						label={DrawingTools[key].name}
						tip={DrawingTools[key].tip}
					/>
				)
			})}
		</Grid>
		<Grid container>
			{!isSmall && <Typography id="stroke-slider" gutterBottom>Size</Typography>}
			<Slider
				defaultValue={5}
				aria-label="Stroke Size"
				valueLabelDisplay="auto"
				orientation={isSmall ? 'vertical' : 'horizontal'}
				// valueLabelFormat={(val)=>`Brush Size ${val}`}
				size="small"
				min={1}
				max={20}
				onChangeCommitted={(e, val) => setTool('strokeWidth', val)}
				aria-labelledby="stroke-slider"
			/>
		</Grid>
		</>
	)
}

export default React.memo(DrawToolPanel);

/**
 * Drawing Tool Button component
 *
 * @prop {string} label Aria-label for button
 * @prop {string|IconDefinition} icon String or Imported object for the icon
 * @prop {boolean} active If button is the active one
 * @prop {function} handleClick Callback for handling clicks
 * @returns {JSX.Element}
 */
const DrawToolButton = React.memo(({
		label,
		icon,
		active,
		tip,
		handleClick
	}) => {
	return (
		<Grid xs="auto">
			<Tooltip title={tip}>
				<IconButton aria-label={label} onClick={handleClick} sx={{
					color: active ? 'primary.dark' : 'inherit',
					"&.MuiButtonBase-root:hover" : {
						color: '#fcea01'
					}
				}}>
					{typeof icon === 'string' ?
						<i className={icon}></i> :
						<FontAwesomeIcon icon={icon} />
					}
				</IconButton>
			</Tooltip>
		</Grid>
	)
});
