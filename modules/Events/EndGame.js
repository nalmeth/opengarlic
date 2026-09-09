import * as Lobby from '../Lobby.js';
import Logger from "../Logger.js";
import { isOwner } from '../EventHelper.js';

/**
 * End Game Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const EndGame = async (io, socket, data) => {
	Logger.info(`ENDGAME ${data.lobbyCode}`);

	try {

		if(!data.lobbyCode) {
			throw new Error(`Invalid Lobby Code: ${data.lobbyCode}`);
		}

		const currentLobby = await Lobby.get(data.lobbyCode);
		if(!isOwner(socket, currentLobby)) {
			throw new Error('Only the lobby owner can end the game.');
		}

		let lobby = null;
		lobby = await Lobby.endGame(data.lobbyCode);

		io.in(data.lobbyCode).emit('LobbyUpdated', lobby);

	} catch(err) {
		socket.emit('error', {
			type: 'EndGame',
			message: err.message
		});
	}
}

export default EndGame;