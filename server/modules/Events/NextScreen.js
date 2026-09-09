import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
import { isOwner } from '../EventHelper.js';
import { ConnectionStatus, PlayerStatus } from '@opengarlic/shared';

/**
 * Next Screen Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const NextScreen = async(io, socket, data) => {
	Logger.info(`NEXTSCR ${data.lobbyCode}`);

	try {
		const currentLobby = await Lobby.get(data.lobbyCode);
		if(!currentLobby) {
			throw new Error(`Invalid Lobby ${data.lobbyCode}`);
		}

		// The lobby owner may always force the next screen. Anyone else may
		// only advance it once the server's own state confirms every
		// connected player has actually finished - this is what lets the
		// "last player to finish advances the screen" flow keep working
		// without letting any client jump the game ahead early.
		if(!isOwner(socket, currentLobby)) {
			const allDone = currentLobby.players.every(player =>
				player.connected === ConnectionStatus.DISCONNECTED ||
				player.status === PlayerStatus.DONE
			);
			if(!allDone) {
				throw new Error('Not all players are done yet.');
			}
		}

		let lobby = null;
		let lobbyData = {};

		lobby = await Lobby.nextScreen(data.lobbyCode);

		if(!await Lobby.setLobbyData(data.lobbyCode, data.lobbyData)) {
			throw new Error('Unable to store lobby data');
		}

		lobbyData = await Lobby.getLobbyData(data.lobbyCode);

		io.in(data.lobbyCode).emit('NextScreen');
		io.in(data.lobbyCode).emit('LobbyDataUpdate', lobbyData);
		io.in(data.lobbyCode).emit('LobbyUpdated', lobby);

	} catch(err) {

		Logger.error(`Error moving to the next screen ${data.lobbyCode}`);
		socket.emit('error', {
			type: 'NextScreen',
			message: err.message
		});
	}
}

export default NextScreen;