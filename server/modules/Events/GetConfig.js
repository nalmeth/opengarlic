import Logger from '../Logger.js';

/**
 * Get Config Event.
 * Sends the client whatever server-tunable gameplay settings it needs at
 * runtime. Kept intentionally small and flat for now - this is also the
 * natural place a future server admin/management tool would read from
 * and write to (swapping the env-var defaults below for values read from
 * Redis, so changes take effect without a container restart).
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const GetConfig = async (io, socket, data) => {
	try {
		const config = {
			floodFill: {
				colorTolerance: Number(process.env.FLOOD_FILL_COLOR_TOLERANCE ?? 32),
				gapTolerance: Number(process.env.FLOOD_FILL_GAP_TOLERANCE ?? 2)
			}
		};

		socket.emit('ServerConfig', config);

	} catch(err) {
		Logger.error(err);
		socket.emit('error', {
			type: 'GetConfig',
			message: err.message
		});
	}
}

export default GetConfig;
