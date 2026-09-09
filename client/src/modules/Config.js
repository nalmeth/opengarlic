import { useEffect, useState } from 'react';
import Socket from './Socket.js';

// Sensible fallback defaults, used until the server responds (or if
// running against an older server without the GetConfig event).
const DEFAULT_CONFIG = {
	floodFill: {
		colorTolerance: 32,
		gapTolerance: 2
	}
};

let cachedConfig = null;
let hasRequested = false;

/**
 * Fetch and cache the server's runtime-tunable gameplay settings.
 * Requested once per page load - every component calling this shares
 * the same result once it arrives, so there's no need to pass it down
 * as a prop through the game-mode component trees.
 * @returns {object} Server config, falling back to defaults until it loads
 */
export const useServerConfig = () => {
	const [config, setConfig] = useState(cachedConfig || DEFAULT_CONFIG);

	useEffect(() => {
		if(!hasRequested) {
			hasRequested = true;
			Socket.emit('message', { type: 'GetConfig', data: {} });
		} else if(cachedConfig) {
			setConfig(cachedConfig);
		}

		const handleConfig = (serverConfig) => {
			cachedConfig = { ...DEFAULT_CONFIG, ...serverConfig };
			setConfig(cachedConfig);
		};

		Socket.on('ServerConfig', handleConfig);
		return () => Socket.off('ServerConfig', handleConfig);
	}, []);

	return config;
}
