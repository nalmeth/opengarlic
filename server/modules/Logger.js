import pino from "pino";
import { fileURLToPath } from "url";
import path from "path";
import * as fs from 'node:fs/promises';

// Build path to folder containing event modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGGER_SRC = path.join(__dirname, '/Loggers');
// Get list of event files
const files = (await fs.readdir(LOGGER_SRC));

// Load list of configured loggers
const loggers = process.env.LOGGERS.split(',').map(item => item.trim());

// List of streams for pino multistream
const streams = [];

// Import Loggers if they are in the config
for(const file of files) {
	const loggerName = path.parse(file).name;
	if(loggers.includes(loggerName)) {
		streams.push({
			stream: (await import('file://' + LOGGER_SRC + '/' + file)).default
		});
	}
}

// Construct logger
const Logger = pino({
	name: 'opengarlic',
	// Minimum level of the streams
	level: 'debug',
	// Log levels show as the name not the number
	formatters: {
		level: (label) => {
			return {level: label}
		}
	}
}, pino.multistream(streams));

export default Logger;