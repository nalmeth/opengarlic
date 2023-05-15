import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
import { PlayerStatus } from "../PlayerStatus.js";
import { ConnectionStatus } from "../ConnectionStatus.js";

/**
 * Player Done Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const DonePlayer = async (io, socket, data) => {

	Logger.info(`Done ${data.playerName} ${data.lobbyCode}`);

	let lobby = await Lobby.done(
		data.playerName,
		data.lobbyCode,
	);

	if(!await Lobby.setLobbyData(data.lobbyCode, data.playerData)) {
		socket.emit('error', {
			type: 'SetLobbyData',
			message: 'Error setting game data.'
		});
		return;
	}

	// Check for all lobby players to be done
	let allDone = true;
	for(const player of lobby.players) {
		if(player.connected === ConnectionStatus.DISCONNECTED) continue;
		if(player.status !== PlayerStatus.DONE) allDone = false;
	}

	// If all players are done, advance the game screen and emit update
	const lobbyData = await Lobby.getLobbyData(data.lobbyCode);
	if(allDone) {
		socket.emit('PlayersDone', lobby, lobbyData);
		return;
	}

	io.in(data.lobbyCode).emit('LobbyDataUpdate', lobbyData);
	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
}

export default DonePlayer;