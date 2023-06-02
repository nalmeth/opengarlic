import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
import filenamify from 'filenamify';

/**
 * Join Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const JoinLobby = async(io, socket, data) => {

	const playerName = filenamify(data.playerName);

	Logger.info(`JOIN ${playerName} ${data.lobbyCode}`);

	let banned = false;

	try {
		let lobby = null;

		if(!data.lobbyCode) {
			throw new Error(`Invalid Lobby Code: ${data.lobbyCode}`);
		}

		const bans = await Lobby.getBans(data.lobbyCode);
		if(bans.includes(socket.handshake.address)) {
			banned = true;
			throw new Error(`Unable to join. You are banned from this lobby.`);
		}

		// Add player to the game lobby
		lobby = await Lobby.join(playerName, data.lobbyCode);

		// Join the lobby room on the socket
		socket.join(data.lobbyCode);
		// We bother to store these on the socket purely for
		// the disconnect handler which doesn't receive this information
		socket.data.playerName = playerName;
		socket.data.lobbyCode = data.lobbyCode;

		const lobbyData = await Lobby.getLobbyData(data.lobbyCode);
		socket.emit('LobbyDataUpdate', lobbyData);

		// Emit event with lobby data
		io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
		socket.emit('LobbyJoined', playerName);

	} catch(err) {

		socket.emit('error', {
			type: 'JoinLobby',
			message: err.message,
			banned: banned
		});
	}
}

export default JoinLobby;