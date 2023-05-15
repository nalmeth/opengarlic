import { ConnectionStatus } from "./ConnectionStatus.js";
import { isEmpty, isTrue } from "./Helpers.js";
import * as Lobby from './Lobby.js';
import { LobbyStatus } from "./LobbyStatus.js";
import Logger from './Logger.js';
import { PlayerStatus } from "./PlayerStatus.js";

/**
 * Handle player leaving a lobby logic
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 */
const LeavePlayer = async (io, socket) => {
	Logger.info(`Leave Player`);

	if(isEmpty(socket.data.playerName) || isEmpty(socket.data.lobbyCode)) return;

	// Remove the player from the lobby
	let lobby = await Lobby.leave(
		socket.data.playerName,
		socket.data.lobbyCode
	);

	if(lobby === null) throw new Error('Lobby error during player leaving');

	console.log(`status: ${lobby.status} players.length: ${lobby.players.length}`);

	// Leave the room on the socket
	socket.leave(socket.data.lobbyCode);

	let destroyed = false;

	if(lobby.players.length < 1) destroyed = await Lobby.destroy(socket.data.lobbyCode);

	if(!destroyed) {

		if(socket.data.playerName === lobby.owner) lobby = await Lobby.setOwner(null, socket.data.lobbyCode);

		// Check for all lobby players to be done
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
			io.to(playerSockets[0].id).emit('PlayersDone', lobby, lobbyData);

			// No need to continue because this will cause a nextscreen event,
			// which will also push out a lobby update.
			return;
		}

		if(lobby.status !== LobbyStatus.ENDED) {
			// Emit event with lobby data to remaining players
			io.in(socket.data.lobbyCode).emit('LobbyUpdated', lobby);
		}
	}

	socket.data.playerName = '';
	socket.data.lobbyCode = '';
	socket.data.owner = false;
}

export default LeavePlayer;