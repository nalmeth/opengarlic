import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';

/**
 * Kick Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const KickLobby = async (io, socket, data) => {

	Logger.info(`KICK ${data.playerName} ${data.lobbyCode}`);

	// Get all the sockets in the game room matching the lobbyCode
	const sockets = await io.in(data.lobbyCode).fetchSockets();

	// Find the socket of the player to kick in the lobby
	let playerSocket = sockets
		.filter(sock => sock.data.playerName === data.playerName)
		.shift();

	// If we found a match, remove the player from the game room
	if(playerSocket) {
		io.in(playerSocket.id).socketsLeave(data.lobbyCode);
	}

	// Remove player from the lobby
	const lobby = await Lobby.leave(data.playerName, data.lobbyCode);
	// Emit a lobby update to the remaining players
	Logger.info('kicklobby send update')
	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
	// Emit an event to the kicked player, notifying them of being kicked
	io.to(playerSocket?.id).emit('KickedFromLobby');
}

export default KickLobby;