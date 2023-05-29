import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';

/**
 * Next Screen Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const NextScreen = async(io, socket, data) => {
	Logger.info(`NEXTSCR ${data.lobbyCode}`);

	try {
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