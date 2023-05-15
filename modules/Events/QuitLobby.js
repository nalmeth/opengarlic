import LeavePlayer from "../EventHelper.js";
import Logger from "../Logger.js";

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