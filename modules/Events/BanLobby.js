import Logger from '../Logger.js';
import * as Lobby from '../Lobby.js';

/**
 * Ban Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const BanLobby = async (io, socket, data) => {
	Logger.info(`Banning ${data.playerName}`);

	const playerSockets = await io.in(data.lobbyCode).fetchSockets();

	let playerAddress = '';
	let sockedId = '';
	for(const pSocket of playerSockets) {
		if(pSocket.data.playerName === data.playerName) {
			sockedId = pSocket.id;
			playerAddress = pSocket.handshake.address;
			break;
		}
	}

	// Remove the player from the room
	io.in(sockedId).socketsLeave(data.lobbyCode);

	// Remove player from the lobby
	let lobby = await Lobby.leave(data.playerName, data.lobbyCode);
	if(lobby === null) {
		socket.emit('error', {
			type: 'BanLobby',
			message: `Unable to remove player: ${data.playerName}`
		});
		return;
	}

	// Ban the player
	lobby = await Lobby.banPlayer(data.lobbyCode, playerAddress);
	if(lobby === null) {
		socket.emit('error', {
			type: 'BanLobby',
			message: `Unable to ban player: ${data.playerName}`
		});
		return;
	}

	io.in(data.lobbyCode).emit('BanLobby', lobby);
}

export default BanLobby;