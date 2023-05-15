import * as Lobby from '../Lobby.js';
import Logger from "../Logger.js";

const EndGame = async (io, socket, data) => {
	Logger.info(`ENDGAME ${data.lobbyCode}`);

	if(!data.lobbyCode) {
		socket.emit('error', {
			type: 'EndGame',
			message: `Invalid Lobby Code: ${data.lobbyCode}`
		});
		return;
	}

	let lobby = null;
	try {
		lobby = await Lobby.endGame(data.lobbyCode);
	} catch(err) {
		socket.emit('error', {
			type: 'EndGame',
			message: err.message
		});
	}

	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
}

export default EndGame;