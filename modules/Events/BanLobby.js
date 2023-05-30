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

	try {

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
		io.to(sockedId).emit('BannedFromLobby');

		// Remove player from the lobby
		let lobby = await Lobby.leave(data.playerName, data.lobbyCode);
		if(lobby === null) {
			throw new Error(`Unable to kick player: ${data.playerName}`);
		}

		// Ban the player
		lobby = await Lobby.banPlayer(data.lobbyCode, playerAddress);
		if(lobby === null) {
			throw new Error(`Unable to ban player: ${data.playerName}`);
		}

		io.in(data.lobbyCode).emit('LobbyUpdated', lobby);

	} catch(err) {

		socket.emit('error', {
			type: 'BanLobby',
			message: err.message
		});
	}
}

export default BanLobby;