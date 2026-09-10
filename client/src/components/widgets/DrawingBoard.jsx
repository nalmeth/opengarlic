import React, { useState, useRef, useEffect } from "react";
import { Box } from '@mui/material';
import { Stage, Layer, Line, Rect, Circle, Shape } from 'react-konva';

import { DrawingTools } from "./DrawingTools";
import {
	debounce,
	isInsideRect, isInsideRectStroke,
	isInsideCircle, isInsideCircleStroke
} from "../../modules/Helpers.js";
import { floodFill, maskToDataUrl } from "../../modules/FloodFill.js";
import { useServerConfig } from "../../modules/Config.js";

/**
 * The Canvas Drawing Area
 * props:
 * 		width: number	 		 - Width of the Drawing Board
 * 		height: number	 		 - Height of the Drawing Board
 * 		brushColor: string 		 - Hex Color code for the brush
 * 		bgColor: string			 - Hex Color code for the background
 * 		strokeWidth: number	 - Width of the brush stroke
 * 		opacity: number		 - Opacity of brush/fill
 * 		lineCap: string			 - Type of cap on the end of lines see Konvajs docs for values
 * 		tension: number		 - Line tension (this should probably not be adjusted)
 * 		tool: object	 		 - See DrawingTools for definition
 * 		onChange: function		 - Callback for updating data
 * 		lockBoard: boolean		 - Flag to lock the drawing board
 * 		displayShapes: array	 - Array of shape objects to preload into state
 * 		stageRef: ref			 - Pass down a ref to get a reference to the stage object
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
const DrawingBoard = (props) => {

	const MAX_WIDTH = props.MAX_WIDTH;
	const MAX_HEIGHT = props.MAX_HEIGHT;

	// Server-configurable flood fill tuning (falls back to sane defaults
	// until the server responds - see modules/Config.js)
	const { floodFill: floodFillConfig } = useServerConfig();

	// Get dimensions to use for the canvas. Size within window
	// bounds up to max size
	const getDimensions = () => ({
		width: (window.innerWidth > MAX_WIDTH ? MAX_WIDTH : window.innerWidth),
		height: window.innerHeight > MAX_HEIGHT ? MAX_HEIGHT : window.innerHeight
	});

	// Get the amount the canvas has been scaled 0-1
	const getScale = () => {
		const scale = Math.min(window.innerWidth / MAX_WIDTH, window.innerHeight / MAX_HEIGHT);
		return scale > 1 ? 1 : scale;
	}

	// State of Canvas dimensions and scale
	const [dimensions, setDimensions] = useState(getDimensions);
	const [scale, setScale] = useState(1);

	// Handle resizing canvas when window is resized
	useEffect(() => {
		// Slow down re-renders on resize for performance.
		// This does, however, make the resizing a bit more jumpy
		const debouncedResize = debounce(() => {
			let newDims = getDimensions();
			const newScale = getScale();
			// const aspect = round2(newDims.x / newDims.y);
			// console.log(newDims.x, newDims.y, 'scale', newScale, 'aspect', aspect);
			newDims.width = newDims.width < MAX_WIDTH ? newDims.width-25 : newDims.width;
			newDims.height = Math.round(newDims.height * newScale);

			// Force bgbox to fill canvas when scaled
			updateShape(0, { width: 1000, height: 600 });

			setDimensions(prevDim => newDims);
			setScale(prevScale => newScale);
		}, 100);
		window.addEventListener('resize', debouncedResize);
		return () => window.removeEventListener('resize', debouncedResize);
	});

	// Flag to lock the board so it can't be drawn on
	const lockBoard = props.lockBoard;

	// Construct rect to use as the background
	const bgRect = {
		tool: DrawingTools.RectFilled.name,
		strokeWidth: 1,
		brushColor: '#fff',
		fillColor: '#fff',
		points: [0, 0, dimensions.width, dimensions.height],
		width: dimensions.width,
		height: dimensions.height,
	}

	// Load shape data if supplied as props
	const initShapes = () =>
		Array.isArray(props.displayShapes) && props.displayShapes.length > 0
		 ? props.displayShapes : [bgRect];

	// State: Array of shapes
	const [shapes, setShapes] = useState(initShapes);
	// Flag indicating active drawing
	const isDrawing = useRef(false);

	// Handle passing shape data up
	useEffect(() => {
		if(props.displayShapes?.length < 1 && props.onChange) props.onChange(shapes);
		// eslint-disable-next-line
	}, [shapes]);

	/**
	 * Handle inital mouse down.
	 * @param {object} event
	 * @returns
	 */
	const handleMouseDown = (event) => {

		if( lockBoard ||								// Ignore if board is locked
			event.evt.button === 2 ||					// Ignore right-clicks
			event.evt.ctrlKey ||						// Ignore ctrl+click
			props.tool.name === DrawingTools.Fill.name ||		// Ignore Paint fill tool
			props.tool.name === DrawingTools.FloodFill.name	// Ignore Flood fill tool
		) return;

		isDrawing.current = true;
		const stage = event.target.getStage();
		const position = stage.getPointerPosition();
		// This is needed to correct drawing position on a scaled stage
		const transform = stage.getAbsoluteTransform().copy();
		const point = transform.invert().point(position);

		// Shape starter object
		let newShape = {
			tool: props.tool.name,
			brushColor: props.brushColor,
			fillColor: props.fillColor,
			opacity: props.opacity,
			strokeWidth: props.strokeWidth,
			lineCap: props.lineCap
		}

		// Set shape specific properties
		switch(props.tool.name) {

			case DrawingTools.Brush.name:
			case DrawingTools.Line.name:
			case DrawingTools.Eraser.name:
			case DrawingTools.Rect.name:
			case DrawingTools.RectFilled.name:
				const pointX = Math.round(point.x);
				const pointY = Math.round(point.y);
				newShape.points = [pointX, pointY, pointX + 1, pointY + 1];
				break;

			case DrawingTools.Circle.name:
			case DrawingTools.CircleFilled.name:
				newShape.points = [Math.round(point.x), Math.round(point.y)];
				newShape.radius = 0;
				break;

			default:
				break;
		}

		// Update shapes state with the start of a new shape
		setShapes(prevShapes => ([
			...prevShapes, newShape
		]));
	}

	// For now these just toggle our drawing flag
	const handleMouseUp = () => { isDrawing.current = false;	}
	const handleMouseLeave = () => { isDrawing.current = false; }

	/**
	 * Handle when the mouse is moving
	 * @param {object} event
	 */
	const handleMouseMove = (event) => {
		if( lockBoard ||									// Ignore if board is locked
			!isDrawing.current ||							// Ignore if we aren't drawing
			props.tool.name === DrawingTools.Fill.name ||		// Ignore paint fill tool
			props.tool.name === DrawingTools.FloodFill.name	// Ignore flood fill tool
		) return;

		const stage = event.target.getStage();
		const position = stage.getPointerPosition();

		// This is needed to correct drawing position on a scaled stage
		const transform = stage.getAbsoluteTransform().copy();
		const point = transform.invert().point(position);
		// Scaled point
		const pointX = Math.round(point.x);
		const pointY = Math.round(point.y);


		// The shape being drawn
		let shapesLen = shapes.length;
		let currentShape = shapes[shapesLen - 1];

		switch(props.tool.name) {

			case DrawingTools.Brush.name:
			case DrawingTools.Eraser.name:
				// Previous x,y coord
				const lastX = currentShape.points[shapesLen-2];
				const lastY = currentShape.points[shapesLen-1];

				// Don't spam the array
				if(lastX === pointX && lastY === pointY) return;

				// Add current cursor (x,y) into the shape's points array.
				updateShape(shapesLen - 1, {
					points: [
						...currentShape.points,
						pointX, pointY
					]
				});
				break;

			case DrawingTools.Line.name:

				//  Get copy of points from last shape,
				//  update the second point to the cursor (x,y).
				const newLinePoints = [...currentShape.points];
				newLinePoints[2] = pointX;
				newLinePoints[3] = pointY;

				updateShape(shapesLen - 1, { points: newLinePoints });
				break;

			case DrawingTools.Rect.name:
			case DrawingTools.RectFilled.name:

				// Get copy of points from last shape,
				// update the second point to the cursor (x,y).
				const newRectPoints = [...currentShape.points];
				newRectPoints[2] = pointX;
				newRectPoints[3] = pointY;

				// Calculate width and height based on start (x,y) and cursor (x,y)
				// Negative values are fine here because it will just draw the other direction
				const width = pointX - newRectPoints[0];
				const height = pointY - newRectPoints[1];

				updateShape(shapesLen - 1, {
					tool: props.tool.name,
					fillColor: props.brushColor,
					points: newRectPoints,
					width,
					height
				});
				break;

			case DrawingTools.Circle.name:
			case DrawingTools.CircleFilled.name:

				// Calculate radius from known center and (x,y) coordinate
				const radius = Math.round(Math.sqrt(
					Math.pow(pointX - currentShape.points[0], 2) +
					Math.pow(pointY - currentShape.points[1], 2)
				));

				updateShape(shapes.length - 1, {
					tool: props.tool.name,
					fillColor: props.brushColor,
					points: [...currentShape.points],
					radius
				});
				break;

			default:
				break;
		}
	}

	/**
	 * Handle Clicks on Canvas objects
	 * @param {object} event
	 */
	const handleClick = (event) => {
		if( lockBoard ||										// Ignore locked board
			event.evt.button === 2 ||							// Ignore right-click
			props.tool.name !== DrawingTools.Fill.name) return;	// Ignore non-fill tools

		const newShapeProps = {
			opacity: props.opacity
		};
		let shapeIdx;

		// Get the top shape/stroke on which the click happened
		const inside = getInsideShape(event.evt);
		console.dir(inside);

		// Check the shape we clicked on according to the event
		const clickIndex = event.currentTarget.index;
		const clickShape = shapes[clickIndex];

		// console.log(event, clickShape.tool, clickIndex);

		// If we clicked a line, brush or eraser and it's on top,
		if((clickShape.tool === DrawingTools.Line.name ||
			clickShape.tool === DrawingTools.Brush.name ||
			clickShape.tool === DrawingTools.Eraser.name) &&
			clickIndex > inside?.top.idx &&
			clickIndex > inside?.stroke.idx
		) {
			// Convert eraser into a brush in order to fill color it
			const newProps = {
				tool: clickShape.tool === DrawingTools.Eraser.name ?
					DrawingTools.Brush.name : clickShape.tool,
				brushColor: props.brushColor
			};
			updateShape(clickIndex, newProps);
			return;
		}
		// console.log(inside);

		// If the click was both in a shape and inside a stroke
		if(inside?.top.idx !== null && inside?.stroke.idx !== null) {

			// If the stroke is the highest, change stroke color
			if(inside.stroke.idx > inside.top.idx) {
				shapeIdx = inside.stroke.idx;
				newShapeProps.tool = inside.stroke.tool;
				newShapeProps.brushColor = props.brushColor;
			}
			// Otherwise the center of a shape is highest, change the fill color
			else {
				shapeIdx = inside.top.idx;
				newShapeProps.fillColor = props.brushColor;
				newShapeProps.tool = getFilledShapeType(inside.top.tool);
			}
			// console.log('fill', shapeIdx);
		}
		// If the click was inside a stroke, change stroke color
		else if(inside?.top.idx === null && inside?.stroke.idx !== null) {
			newShapeProps.brushColor = props.brushColor;
			newShapeProps.tool = inside.stroke.tool;
			shapeIdx = inside.stroke.idx;
			// console.log('stroke', shapeIdx);
		}
		// Click was not inside a shape (including stroke), this is a background click
		else if(inside?.top.idx === null && inside?.stroke.idx === null) {
			newShapeProps.tool = DrawingTools.RectFilled.name;
			newShapeProps.fillColor = props.brushColor;
			newShapeProps.brushColor = props.brushColor;
			shapeIdx = 0;
			// console.log('fill & stroke', shapeIdx);
		}

		// Update State
		updateShape(shapeIdx, newShapeProps);
	}

	/**
	 * Handle a click with the Flood Fill tool active. Unlike handleClick,
	 * this isn't about which single shape was clicked - it rasterizes the
	 * current drawing and floods outward from the click point across
	 * contiguous same-colored pixels, so it can fill a region bounded by
	 * more than one overlapping outlined shape.
	 * @param {object} event
	 */
	const handleFloodFillClick = (event) => {
		if( lockBoard ||
			event.evt.button === 2 ||
			props.tool.name !== DrawingTools.FloodFill.name
		) return;

		const stage = event.target.getStage();
		const position = stage.getPointerPosition();
		const transform = stage.getAbsoluteTransform().copy();
		const point = transform.invert().point(position);
		const clickX = Math.round(point.x);
		const clickY = Math.round(point.y);

		if(clickX < 0 || clickY < 0 || clickX >= MAX_WIDTH || clickY >= MAX_HEIGHT) return;

		// Temporarily render the stage at full, unscaled logical resolution
		// so pixel coordinates line up 1:1 with the shapes' own point
		// coordinates - the same trick already used when exporting the
		// finished drawing for the round's GIF recap.
		const prevWidth = stage.width();
		const prevHeight = stage.height();
		const prevScale = stage.scale();

		stage.width(MAX_WIDTH);
		stage.height(MAX_HEIGHT);
		stage.scale({ x: 1, y: 1 });

		const canvas = stage.toCanvas();
		const ctx = canvas.getContext('2d');
		const imageData = ctx.getImageData(0, 0, MAX_WIDTH, MAX_HEIGHT);

		stage.width(prevWidth);
		stage.height(prevHeight);
		stage.scale(prevScale);
		stage.batchDraw();

		const result = floodFill(imageData, clickX, clickY, {
			colorTolerance: floodFillConfig.colorTolerance,
			gapTolerance: floodFillConfig.gapTolerance
		});

		// Nothing fillable at that point (e.g. clicked right on a boundary)
		if(!result) return;

		const newShape = {
			tool: DrawingTools.FloodFill.name,
			fillColor: props.brushColor,
			opacity: props.opacity,
			x: result.bbox.x,
			y: result.bbox.y,
			width: result.bbox.width,
			height: result.bbox.height,
			maskData: maskToDataUrl(result)
		};

		// Insert just above the background rect (index 0) so it never
		// covers any stroke that was already drawn on top of it.
		setShapes(prevShapes => {
			const nextShapes = [...prevShapes];
			nextShapes.splice(1, 0, newShape);
			return nextShapes;
		});
	}

	/**
	 * Returns the Filled variant of the shape name
	 * @param {string} name String name of drawing tool
	 * @returns {string}
	 */
	const getFilledShapeType = (name) => {
		switch(name) {
			case DrawingTools.Rect.name:
			case DrawingTools.RectFilled.name:
				return DrawingTools.RectFilled.name;
			case DrawingTools.Circle.name:
			case DrawingTools.CircleFilled.name:
				return DrawingTools.CircleFilled.name;
			default:
				return '';
		}
	}

	/**
	 * Get information about what shapes the click event was inside
	 * @param {object} event
	 * @returns {object}
	 */
	const getInsideShape = (event) => {
		let topShape = null;
		let topStroke = null;
		let topTool = null;
		let strokeTool = null;

		shapes.forEach((shape, idx) => {
			switch(shape.tool) {

				case DrawingTools.RectFilled.name:
				case DrawingTools.Rect.name:
					if(isInsideRect(event, shape, scale)) {
						topTool = shape.tool;
						topShape = idx;
					}
					if(isInsideRectStroke(event, shape, scale)) {
						strokeTool = shape.tool;
						topStroke = idx;
					}
					break;

				case DrawingTools.CircleFilled.name:
				case DrawingTools.Circle.name:
					if(isInsideCircle(event, shape, scale)) {
						topTool = shape.tool;
						topShape = idx;
					}
					if(isInsideCircleStroke(event, shape, scale)) {
						strokeTool = shape.tool;
						topStroke = idx;
					}
					break;

				default:
					break;
			}
		});

		return {
			top: {
				idx: topShape,
				tool: topTool
			},
			stroke: {
				idx: topStroke,
				tool: strokeTool
			}
		};
	}

	/**
	 * Updates the properties of a shape in state
	 * // TODO - Maybe make this support multiple indexes to update at once,
	 * // 		either with one data to apply to all, or array of datas matching indexes.
	 * //		At which point, maybe just make one key/value object parameter -- idk yet
	 *
	 * @param {number} index Index of the shape
	 * @param {object} data Key/Value pairs of properties to update
	 */
	const updateShape = (index, data) => {
		const newShapes = shapes.map((shape, idx) => {
			if(idx === index) {
				return ({ ...shape, ...data });
			}
			return shape;
		});
		// console.log('updated shapes', newShapes);
		setShapes(prevShapes => newShapes);
	}

	return (
		<Box className="drawingBoard" sx={{}}>

			<Stage
				ref={props.stageRef}
				width={dimensions.width}
				height={dimensions.height}
				scaleX={scale}
				scaleY={scale}
				// onClick={handleClick}
				onClick={handleFloodFillClick}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onTouchStart={handleMouseDown}
				onTouchEnd={handleMouseUp}
				onTouchMove={handleMouseMove}
			>
				<Layer>
					{shapes.map(
						(shape, idx) => {
							switch(shape.tool) {
								case DrawingTools.Brush.name:
								case DrawingTools.Eraser.name:
								case DrawingTools.Line.name:
									return (
										<Line
											key={idx}
											points={shape.points}
											stroke={shape.tool === DrawingTools.Eraser.name ? '#fff': shape.brushColor}
											strokeWidth={shape.strokeWidth}
											opacity={shape.opacity}
											tension={props.tension}
											lineCap={shape.lineCap}
											lineJoin="round"
											listening={shape.tool === DrawingTools.Eraser.name ? false : true}
											// for now, things are easier and fine to just paint white instead of actual erasing
											// shape.tool === 'eraser' ? 'destination-out' : 'source-over'
											globalCompositeOperation={'source-over'}
											shadowForStrokeEnabled={false}
											onClick={handleClick}
										/>
									)
								case DrawingTools.Rect.name:
								case DrawingTools.RectFilled.name:
									return (
										<Rect
											key={idx}
											stroke={shape.brushColor}
											strokeWidth={shape.strokeWidth}
											opacity={shape.opacity}
											tension={props.tension}
											lineCap={shape.lineCap}
											x={shape.points[0]}
											y={shape.points[1]}
											width={shape.width}
											height={shape.height}
											fill={shape.fillColor}
											fillEnabled={shape.tool === DrawingTools.RectFilled.name}
											shadowForStrokeEnabled={false}
											onClick={handleClick}
										/>
									)
								case DrawingTools.Circle.name:
								case DrawingTools.CircleFilled.name:
									return (
										<Circle
											key={idx}
											x={shape.points[0]}
											y={shape.points[1]}
											stroke={shape.brushColor}
											strokeWidth={shape.strokeWidth}
											opacity={shape.opacity}
											lineCap={shape.lineCap}
											tension={props.tension}
											radius={shape.radius}
											fill={shape.fillColor}
											fillEnabled={shape.tool === DrawingTools.CircleFilled.name}
											shadowForStrokeEnabled={false}
											onClick={handleClick}
										/>
									)
								case DrawingTools.FloodFill.name:
									return (
										<FloodFillShape key={idx} shape={shape} />
									)
								default:
									return null;
							}
						}
					)}
				</Layer>
			</Stage>

		</Box>
	)
}


export default DrawingBoard;

/**
 * Renders a Flood Fill shape by compositing its colorless mask image with
 * its current fillColor (globalCompositeOperation: 'source-in'). Keeping
 * color out of the stored mask is what lets fillColor be changed later
 * without re-running the flood fill.
 * @prop {object} shape Shape data: x, y, width, height, fillColor, maskData, opacity
 * @returns {JSX.Element|null}
 */
const FloodFillShape = React.memo(({ shape }) => {
	const [maskImage, setMaskImage] = useState(null);

	useEffect(() => {
		if(!shape.maskData) return;
		const img = new window.Image();
		img.onload = () => setMaskImage(img);
		img.src = shape.maskData;
	}, [shape.maskData]);

	if(!maskImage) return null;

	return (
		<Shape
			x={shape.x}
			y={shape.y}
			width={shape.width}
			height={shape.height}
			opacity={shape.opacity}
			listening={false}
			sceneFunc={(ctx, node) => {
				ctx.save();
				ctx.drawImage(maskImage, 0, 0, shape.width, shape.height);
				ctx.globalCompositeOperation = 'source-in';
				ctx.fillStyle = shape.fillColor;
				ctx.fillRect(0, 0, shape.width, shape.height);
				ctx.restore();
			}}
		/>
	)
});