import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';

/**
 * Join Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const JoinLobby = async(io, socket, data) => {

	Logger.info(`JOIN ${data.playerName} ${data.lobbyCode}`);

	if(!data.lobbyCode) {
		socket.emit('error', {
			type: 'JoinLobby',
			message: `Invalid Lobby Code: ${data.lobbyCode}`
		});
		return;
	}

	let lobby = null;
	try {
		// Add player to the game lobby
		lobby = await Lobby.join(data.playerName, data.lobbyCode);
	} catch(err) {

		socket.emit('error', {
			type: 'JoinLobby',
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

	// Emit event with lobby data
	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
}

export default JoinLobby;