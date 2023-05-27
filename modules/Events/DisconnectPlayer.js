import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
import { ConnectionStatus } from "../ConnectionStatus.js";
import { PlayerStatus } from "../PlayerStatus.js";
import { LobbyStatus } from "../LobbyStatus.js";

/**
 * Player Disconnect Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const DisconnectPlayer = async (io, socket, data) => {

	Logger.info(`Client Disconnect: ${data.reason} ${socket.data.lobbyCode} ${socket.data.playerName}`);
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
		setTimeout(async () => {
			const lobby = await Lobby.get(lobbyCode);

			// If no players are available. Destroy lobby.
			if(!lobby?.players || lobby.players.length < 1) {
				await Lobby.destroy(lobbyCode);
				return;
			}

			// Find if player has reconnected
			const connectedPlayers = lobby.players.
					filter(player => player.connected !== ConnectionStatus.DISCONNECTED);
			const connectedNames = connectedPlayers.map(player => player.name.toLowerCase());
			const reconnected = connectedNames.includes(disconnectedPlayer.name.toLowerCase());

			// If owner has not reconnected, pass lead to first available player
			if(!reconnected) {
				Logger.info('Owner has not reconnected. Change Owner');

				let newLobby = await Lobby.setPlayers(lobbyCode, connectedPlayers);
				newLobby = await Lobby.setOwner(null, lobbyCode);

				// Check if all players are done (in case we're midgame)
				let allDone = true;
				for(const player of lobby.players) {
					if(player.connected === ConnectionStatus.DISCONNECTED) continue;
					if(player.status !== PlayerStatus.DONE) allDone = false;
				}

				// If all players are done, advance the game screen and emit update
				if(allDone) {
					// Get lobby data to push out
					const lobbyData = await Lobby.getLobbyData(socket.data.lobbyCode);

					// Find and emit to first client still connected
					const playerSockets = await io.in(socket.data.lobbyCode).fetchSockets();
					if(playerSockets[0]?.id) {
						io.to(playerSockets[0].id).emit('PlayersDone', newLobby, lobbyData);
					}

					// No need to continue because this will cause a nextscreen event,
					// which will also push out a lobby update.
					return;
				}

				io.in(lobbyCode).emit('LobbyUpdated', newLobby);
			}

		}, 30000);
	}

	try {

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
			setTimeout(async() => {
				const lobby = await Lobby.get(lobbyCode);

				// If no players are available. Destroy lobby.
				if(!lobby?.players || lobby.players.length < 1) {
					await Lobby.destroy(lobbyCode);
					return;
				}

				// Find if player has reconnected
				const connectedPlayers = lobby.players.
						filter(player => player.connected !== ConnectionStatus.DISCONNECTED);
				const connectedNames = connectedPlayers.map(player => player.name.toLowerCase());
				const reconnected = connectedNames.includes(disconnectedPlayer.name.toLowerCase());

				// If they haven't reconnected
				if(!reconnected) {
					// remove from player list
					const newLobby = await Lobby.setPlayers(lobbyCode, connectedPlayers);

					// No need to notify if lobby is ended
					if(newLobby.status === LobbyStatus.ENDED) {
						return;
					}

					// Check if all players are done (in case we're midgame)
					let allDone = true;
					for(const player of lobby.players) {
						if(player.connected === ConnectionStatus.DISCONNECTED) continue;
						if(player.status !== PlayerStatus.DONE) allDone = false;
					}

					// If all players are done, advance the game screen and emit update
					if(allDone) {
						// Get lobby data to push out
						const lobbyData = await Lobby.getLobbyData(socket.data.lobbyCode);

						// Find and emit to first client still connected
						const playerSockets = await io.in(socket.data.lobbyCode).fetchSockets();
						if(playerSockets[0]?.id) {
							io.to(playerSockets[0].id).emit('PlayersDone', newLobby, lobbyData);
						}

						// No need to continue because this will cause a nextscreen event,
						// which will also push out a lobby update.
						return;
					}

					Logger.info('Lobby player has not reconnected. Removing.');

					io.in(lobbyCode).emit('LobbyUpdated', newLobby);
				}
			}, 3000);
		}

	} catch(err) {
		socket.emit('error', {
			type: 'DisconnectPlayer',
			message: err.message
		});
	}
}

export default DisconnectPlayer;