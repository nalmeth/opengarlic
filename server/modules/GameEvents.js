import GameEventEmitter from "./GameEventEmitter.js";
import * as fs from 'node:fs/promises';
import path from "node:path";
import { fileURLToPath } from "node:url";

// Build path to folder containing event modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EVENT_SRC = path.join(__dirname, '/Events');

const importedEvents = {};
// Get list of event files
const files = (await fs.readdir(EVENT_SRC));

// Import the default export from each event module
for (const file of files) {
	importedEvents[path.parse(file).name] =
		(await import('file://' + EVENT_SRC + '/' + file)).default;
}

/**
 * Returns the list of imported event names
 * @returns {array}
 */
const EventList = () => {
	return Object.keys(importedEvents);
}
export default EventList;

/**
 * Attach all the events to the GameEventEmitter
 */
EventList().forEach((key) => {
	GameEventEmitter.on(key, importedEvents[key]);
});