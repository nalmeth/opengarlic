import LeavePlayer from "../EventHelper.js";
import Logger from "../Logger.js";

/**
 * Quit Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const QuitLobby = async (io, socket, data) => {
	Logger.info(`Quit ${data.playerName} ${data.lobbyCode}`);

	try {

		await LeavePlayer(io, socket);

	} catch(err) {
		socket.emit('error', {
			type: 'QuitLobby',
			message: err.message
		});
	}
}

export default QuitLobby;