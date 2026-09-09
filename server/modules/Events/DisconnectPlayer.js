import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
import { ConnectionStatus, PlayerStatus, LobbyStatus } from '@opengarlic/shared';

/**
 * After a delay, check whether a disconnected player has reconnected.
 * If not, remove them from the lobby (transferring ownership first if
 * they were the owner), then either advance the game (if everyone
 * remaining is done) or push a lobby update.
 * @param {object} io Server Object
 * @param {string} lobbyCode Lobby Code
 * @param {object} disconnectedPlayer The player who disconnected
 * @param {boolean} wasOwner Whether the disconnected player was the lobby owner
 */
const checkReconnectAndAdvance = async (io, lobbyCode, disconnectedPlayer, wasOwner) => {
	const lobby = await Lobby.get(lobbyCode);

	// If no players are available. Destroy lobby.
	if(!lobby?.players || lobby.players.length < 1) {
		await Lobby.destroy(lobbyCode);
		return;
	}

	// Find if player has reconnected
	const connectedPlayers = lobby.players
			.filter(player => player.connected !== ConnectionStatus.DISCONNECTED);
	const connectedNames = connectedPlayers.map(player => player.name.toLowerCase());
	const reconnected = connectedNames.includes(disconnectedPlayer.name.toLowerCase());

	// They reconnected in time - nothing to do
	if(reconnected) return;

	Logger.info(wasOwner
		? 'Owner has not reconnected. Change Owner'
		: 'Lobby player has not reconnected. Removing.');

	// Remove from player list, passing ownership on if needed
	let newLobby = await Lobby.setPlayers(lobbyCode, connectedPlayers);
	if(wasOwner) {
		newLobby = await Lobby.setOwner(null, lobbyCode);
	}

	// No need to notify if lobby has already ended
	if(newLobby.status === LobbyStatus.ENDED) return;

	// Check if all remaining players are done (in case we're midgame)
	const allDone = lobby.players.every(player =>
		player.connected === ConnectionStatus.DISCONNECTED ||
		player.status === PlayerStatus.DONE
	);

	// If all players are done, advance the game screen and emit update
	if(allDone) {
		const lobbyData = await Lobby.getLobbyData(lobbyCode);

		// Find and emit to first client still connected
		const playerSockets = await io.in(lobbyCode).fetchSockets();
		if(playerSockets[0]?.id) {
			io.to(playerSockets[0].id).emit('PlayersDone', newLobby, lobbyData);
		}

		// No need to continue because this will cause a nextscreen event,
		// which will also push out a lobby update.
		return;
	}

	io.in(lobbyCode).emit('LobbyUpdated', newLobby);
}

/**
 * Player Disconnect Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const DisconnectPlayer = async (io, socket, data) => {

	Logger.info(`Client Disconnect: ${data.reason} ${socket.data.lobbyCode} ${socket.data.playerName}`);
	try {
		const disconnectedPlayer = await Lobby.getPlayer(socket.data.playerName, socket.data.lobbyCode);

		// Reference for timeout callback (socket data is cleared)
		const lobbyCode = socket.data.lobbyCode;

		/**
		 * Set a timeout to check if the player has
		 * reconnected (if they're the owner)
		 */
		if(disconnectedPlayer?.owner) {
			Logger.info('Lobby owner disconnected.');

			// In 30 seconds, check to see if the lobby owner has reconnected
			setTimeout(
				() => checkReconnectAndAdvance(io, lobbyCode, disconnectedPlayer, true),
				30000
			);
		}

		// Make the player leave the lobby
		// await LeavePlayer(io, socket, false);
		const newPlayer = {
			...disconnectedPlayer,
			connected: ConnectionStatus.DISCONNECTED
		};

		const success = await Lobby.setPlayer(socket.data.lobbyCode, disconnectedPlayer.name, newPlayer);
		// If not lobby owner, give them a few seconds to rejoin
		// or else notify lobby
		if(!disconnectedPlayer.owner) {
			setTimeout(
				() => checkReconnectAndAdvance(io, lobbyCode, disconnectedPlayer, false),
				3000
			);
		}

	} catch(err) {

		socket.emit('error', {
			type: 'DisconnectPlayer',
			message: err.message
		});
	}
}

export default DisconnectPlayer;