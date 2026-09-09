/**
 * Run a gap-tolerant flood fill starting at (startX, startY).
 *
 * A pixel is treated as part of the fill if it directly matches the
 * starting pixel's color (within colorTolerance), OR - if gapTolerance is
 * set - if a matching pixel is within gapTolerance pixels of it. The
 * latter bridges small, unintentional gaps in a hand-drawn boundary
 * without letting the fill leak through genuinely open areas or
 * intentionally thick strokes (those have no matching pixel within such
 * a small radius).
 *
 * @param {ImageData} imageData Pixel data of the current drawing
 * @param {number} startX Logical x coordinate of the click
 * @param {number} startY Logical y coordinate of the click
 * @param {object} [options]
 * @param {number} [options.colorTolerance=32] Per-channel tolerance (0-255) for deciding two pixels are "the same color"
 * @param {number} [options.gapTolerance=2] Pixel radius used to bridge thin, unintentional gaps in a boundary
 * @returns {{ mask: Uint8Array, width: number, height: number, bbox: {x:number,y:number,width:number,height:number} } | null}
 */
export const floodFill = (imageData, startX, startY, options = {}) => {
	const { colorTolerance = 32, gapTolerance = 2 } = options;
	const { width, height, data } = imageData;

	startX = Math.round(startX);
	startY = Math.round(startY);
	if(startX < 0 || startY < 0 || startX >= width || startY >= height) return null;

	const pixelIndex = (x, y) => (y * width + x) * 4;
	const startIdx = pixelIndex(startX, startY);
	const startR = data[startIdx], startG = data[startIdx + 1],
		startB = data[startIdx + 2], startA = data[startIdx + 3];

	// Pass 1: which pixels directly match the color we're flooding from.
	const matches = new Uint8Array(width * height);
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			const i = pixelIndex(x, y);
			const isMatch =
				Math.abs(data[i] - startR) <= colorTolerance &&
				Math.abs(data[i + 1] - startG) <= colorTolerance &&
				Math.abs(data[i + 2] - startB) <= colorTolerance &&
				Math.abs(data[i + 3] - startA) <= colorTolerance;
			matches[y * width + x] = isMatch ? 1 : 0;
		}
	}

	// Pass 2: gap-tolerant "fillable" test, memoized so each pixel's small
	// radius search only runs once even though the scanline fill below may
	// ask about the same pixel from more than one direction.
	const fillableCache = new Int8Array(width * height).fill(-1);
	const isFillable = (x, y) => {
		const cacheIdx = y * width + x;
		if(fillableCache[cacheIdx] !== -1) return fillableCache[cacheIdx] === 1;

		let fillable = matches[cacheIdx] === 1;
		if(!fillable && gapTolerance > 0) {
			const minX = Math.max(0, x - gapTolerance), maxX = Math.min(width - 1, x + gapTolerance);
			const minY = Math.max(0, y - gapTolerance), maxY = Math.min(height - 1, y + gapTolerance);
			outer:
			for(let ny = minY; ny <= maxY; ny++) {
				for(let nx = minX; nx <= maxX; nx++) {
					if(matches[ny * width + nx]) { fillable = true; break outer; }
				}
			}
		}

		fillableCache[cacheIdx] = fillable ? 1 : 0;
		return fillable;
	};

	// Pass 3: scanline flood fill from the click point using the fillable test.
	const mask = new Uint8Array(width * height);
	let minX = startX, maxX = startX, minY = startY, maxY = startY;

	const stack = [[startX, startY]];
	while(stack.length) {
		const [sx, sy] = stack.pop();
		if(mask[sy * width + sx] || !isFillable(sx, sy)) continue;

		// Walk left to the start of this fillable span on the current row
		let xLeft = sx;
		while(xLeft > 0 && !mask[sy * width + (xLeft - 1)] && isFillable(xLeft - 1, sy)) xLeft--;

		let spanAbove = false, spanBelow = false;
		let x = xLeft;
		while(x < width && !mask[sy * width + x] && isFillable(x, sy)) {
			mask[sy * width + x] = 1;
			if(x < minX) minX = x;
			if(x > maxX) maxX = x;
			if(sy < minY) minY = sy;
			if(sy > maxY) maxY = sy;

			if(sy > 0) {
				const above = !mask[(sy - 1) * width + x] && isFillable(x, sy - 1);
				if(above && !spanAbove) { stack.push([x, sy - 1]); spanAbove = true; }
				else if(!above) spanAbove = false;
			}
			if(sy < height - 1) {
				const below = !mask[(sy + 1) * width + x] && isFillable(x, sy + 1);
				if(below && !spanBelow) { stack.push([x, sy + 1]); spanBelow = true; }
				else if(!below) spanBelow = false;
			}
			x++;
		}
	}

	// Nothing meaningful filled (e.g. clicked directly on a solid boundary)
	if(maxX < minX || maxY < minY) return null;

	return {
		mask, width, height,
		bbox: {
			x: minX, y: minY,
			width: maxX - minX + 1,
			height: maxY - minY + 1
		}
	};
}

/**
 * Convert a flood fill result into a small, cropped black & white PNG data
 * URL. Only the alpha channel is meaningful (opaque = filled, transparent
 * = not filled) - RGB is discarded when this is composited with the
 * shape's actual fillColor at render time. Keeping color out of the mask
 * is what lets the fill be re-colored later just like any other shape.
 * @param {object} result Output of floodFill()
 * @returns {string} PNG data URL, cropped to result.bbox
 */
export const maskToDataUrl = (result) => {
	const { mask, width, bbox } = result;
	const canvas = document.createElement('canvas');
	canvas.width = bbox.width;
	canvas.height = bbox.height;
	const ctx = canvas.getContext('2d');
	const imageData = ctx.createImageData(bbox.width, bbox.height);

	for(let y = 0; y < bbox.height; y++) {
		for(let x = 0; x < bbox.width; x++) {
			const srcIdx = (bbox.y + y) * width + (bbox.x + x);
			const dstIdx = (y * bbox.width + x) * 4;
			const on = mask[srcIdx];
			imageData.data[dstIdx] = 255;
			imageData.data[dstIdx + 1] = 255;
			imageData.data[dstIdx + 2] = 255;
			imageData.data[dstIdx + 3] = on ? 255 : 0;
		}
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL();
}
