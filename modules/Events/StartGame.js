import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';
/**
 * Start Game Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const StartGame = async (io, socket, data) => {

	Logger.info(`START ${data.lobbyCode} ${data.mode}`);

	const lobby = await Lobby.start(
		data.lobbyCode,
		data.mode,
		data.appScreen,
		data.settings
	);

	if(lobby === null) {
		socket.emit('error',{
			type: 'StartGame',
			message: 'Error starting Lobby'
		});
		return;
	}

	io.in(data.lobbyCode).emit('LobbyUpdated', lobby);
}

export default StartGame;