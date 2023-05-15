import * as Lobby from '../Lobby.js';
import LeavePlayer from "../EventHelper.js";
import Logger from '../Logger.js';
import { ConnectionStatus } from "../ConnectionStatus.js";

/**
 * Player Disconnect Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const DisconnectPlayer = async (io, socket, data) => {

	Logger.info(`Client Disconnect: ${data.reason} ${socket.data.lobbyCode} ${socket.data.playerName}`);
	const disconnectedPlayer = await Lobby.getPlayer(socket.data.playerName, socket.data.lobbyCode);

	/**
	 * Set a timeout to check if the player has
	 * reconnected (if they're the owner)
	 */
	if(disconnectedPlayer?.owner) {
		Logger.info('Lobby owner disconnected.');

		// Reference for timeout callback (socket data is cleared)
		const lobbyCode = socket.data.lobbyCode;
		// In 30 seconds, check to see if the lobby owner has reconnected
		setTimeout(async () => {
			const lobby = await Lobby.get(lobbyCode);

			// If no players are available. Destroy lobby.
			if(!lobby?.players || lobby.players.length < 1) {
				await Lobby.destroy(lobbyCode);
				return;
			}

			const connectedPlayers = lobby.players.
					filter(player => player.connected !== ConnectionStatus.DISCONNECTED)
					.map(player => player.name.toLowerCase());
			const reconnected = connectedPlayers.includes(disconnectedPlayer.name.toLowerCase());

			// If owner has not reconnected, pass lead to first available player
			if(!reconnected) {
				Logger.info('Owner has not reconnected. Change Owner');
				const newLobby = await Lobby.setOwner(null, lobbyCode);
				io.in(lobbyCode).emit('LobbyUpdated', newLobby);
			}

		}, 30000);
	}

	try {

		// Make the player leave the lobby
		await LeavePlayer(io, socket, false);
	} catch(err) {
		socket.emit('error', {
			type: 'DisconnectPlayer',
			message: err.message
		});
	}
}

export default DisconnectPlayer;