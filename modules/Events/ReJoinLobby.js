import * as Lobby from '../Lobby.js';
import Logger from "../Logger.js";

/**
 * Re-join lobby event
 * @param {object} io
 * @param {object} socket
 * @param {object} data
 */
const ReJoinLobby = async(io, socket, data) => {

	Logger.info(`REJOIN ${data.playerName} ${data.lobbyCode}`);

	if(!data.lobbyCode) {
		socket.emit('error', {
			type: 'ReJoinLobby',
			message: `Invalid Lobby Code: ${data.lobbyCode}`
		});
		return;
	}

	let lobby = null;
	try {
		lobby = await Lobby.rejoin(data.playerName, data.lobbyCode);
	} catch(err) {
		socket.emit('error', {
			type: 'ReJoinLobby',
			message: err.message
		});
		return;
	}

	// Join the lobby room on the socket
	socket.join(data.lobbyCode);
	// We bother to store these on the socket purely for
	// the disconnect handler which doesn't receive this information
	socket.data.playerName = data.playerName;
	socket.data.lobbyCode = data.lobbyCode;

	const lobbyData = await Lobby.getLobbyData(data.lobbyCode);

	socket.emit('LobbyDataUpdate', lobbyData);
	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
}

export default ReJoinLobby;