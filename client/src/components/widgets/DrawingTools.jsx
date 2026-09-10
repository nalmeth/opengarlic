import React, { useState, useEffect } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Box,
	IconButton,
	Popover,
	Slider,
	Tooltip,
	Typography,
	useMediaQuery
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
	faEraser as EraserIcon, faPaintBrush as BrushIcon,
	faFillDrip as FillIcon, faFill as FloodFillIcon, //faDrawPolygon as PolygonIcon,
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
	FloodFill: {
		name: 'floodfill',
		icon: FloodFillIcon,
		cursor: 'crosshair',
		tip: 'Flood Fill'
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
 * Groups of tools that share a single toolbar slot. A group with one tool
 * renders as a plain button. A group with more than one tool renders as a
 * single button (last tool picked in that group) plus a small corner
 * flyout to switch between the group's variants - e.g. Fill / FloodFill.
 */
export const ToolGroups = [
	['Brush'],
	['Line'],
	['Eraser'],
	['Fill', 'FloodFill'],
	['Rect'],
	['RectFilled'],
	['Circle'],
	['CircleFilled']
];

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
			{ToolGroups.map(groupKeys => {
				const tools = groupKeys.map(key => DrawingTools[key]);

				if(tools.length === 1) {
					const tool = tools[0];
					return (
						<DrawToolButton
							key={tool.name}
							active={activeTool === tool.name}
							name={tool.name}
							icon={tool.icon}
							handleClick={() => setTool('tool', tool)}
							label={tool.name}
							tip={tool.tip}
						/>
					)
				}

				return (
					<DrawToolButtonGroup
						key={groupKeys.join('-')}
						tools={tools}
						activeTool={activeTool}
						onSelect={(tool) => setTool('tool', tool)}
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
				max={40}
				onChangeCommitted={(e, val) => setTool('strokeWidth', val)}
				aria-labelledby="stroke-slider"
			/>
		</Grid>
		</>
	)
}

export default React.memo(DrawToolPanel);

/**
 * Grouped Drawing Tool Button component - a main button (the last-picked
 * tool in the group, defaulting to the first) plus a small always-visible
 * corner triangle. Clicking the main button uses the current selection;
 * clicking the triangle opens a flyout to pick a different tool in the
 * group, which then becomes the group's new default.
 *
 * @prop {object[]} tools Tool definitions in this group
 * @prop {string} activeTool Name of the currently active tool (board-wide)
 * @prop {function} onSelect Callback invoked with the picked tool definition
 * @returns {JSX.Element}
 */
const DrawToolButtonGroup = React.memo(({ tools, activeTool, onSelect }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedName, setSelectedName] = useState(
		tools.find(tool => tool.name === activeTool)?.name ?? tools[0].name
	);

	// If something outside this group activates one of our tools
	// (e.g. restoring a saved tool selection), reflect that as our
	// remembered default too.
	useEffect(() => {
		const activeInGroup = tools.find(tool => tool.name === activeTool);
		if(activeInGroup && activeInGroup.name !== selectedName) {
			setSelectedName(activeInGroup.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTool]);

	const selectedTool = tools.find(tool => tool.name === selectedName) ?? tools[0];
	const isOpen = Boolean(anchorEl);

	const handlePick = (tool) => {
		setSelectedName(tool.name);
		onSelect(tool);
		setAnchorEl(null);
	};

	return (
		<Grid xs="auto">
			<Box sx={{ position: 'relative', display: 'inline-flex' }}>
				<Tooltip title={selectedTool.tip}>
					<IconButton
						aria-label={selectedTool.name}
						onClick={() => onSelect(selectedTool)}
						sx={{
							color: activeTool === selectedTool.name ? 'primary.dark' : 'inherit',
							"&.MuiButtonBase-root:hover" : {
								color: '#fcea01'
							}
						}}
					>
						{typeof selectedTool.icon === 'string' ?
							<i className={selectedTool.icon}></i> :
							<FontAwesomeIcon icon={selectedTool.icon} />
						}
					</IconButton>
				</Tooltip>
				<IconButton
					aria-label={`${selectedTool.name}-more-options`}
					size="small"
					onClick={(event) => setAnchorEl(event.currentTarget)}
					sx={{
						position: 'absolute',
						right: 0,
						bottom: 0,
						padding: 0,
						minWidth: 0,
						width: 16,
						height: 16,
						color: 'inherit'
					}}
				>
					<Box component="span" sx={{
						width: 0,
						height: 0,
						borderStyle: 'solid',
						borderWidth: '0 0 8px 8px',
						borderColor: 'transparent transparent currentColor transparent'
					}} />
				</IconButton>
			</Box>
			<Popover
				open={isOpen}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			>
				<Grid container direction="row" spacing={0.5} sx={{ p: 0.5 }}>
					{tools.map(tool => (
						<DrawToolButton
							key={tool.name}
							active={activeTool === tool.name}
							name={tool.name}
							icon={tool.icon}
							handleClick={() => handlePick(tool)}
							label={tool.name}
							tip={tool.tip}
						/>
					))}
				</Grid>
			</Popover>
		</Grid>
	)
});

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
