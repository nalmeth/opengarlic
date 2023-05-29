import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';

/**
 * Create Lobby Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const CreateLobby = async (io, socket, data) => {

	Logger.info(`Create ${data.playerName}`);

	// Create the lobby
	const lobby = await Lobby.create(data.playerName, data.appScreen);

	if(lobby === null) {
		socket.emit('error', {
			type: 'CreateLobby',
			message: 'Error creating lobby.'
		});
		return;
	}

	Logger.info(`Created Lobby: ${lobby?.code}`);

	// Join the lobby room on the socket
	socket.join(lobby.code);

	// We bother to store these on the socket purely for
	// the disconnect handler which doesn't receive this information
	socket.data.playerName = data.playerName;
	socket.data.owner = true;
	socket.data.lobbyCode = lobby.code;

	// Emit event lobby data
	socket.emit('LobbyCreated', lobby);
}

export default CreateLobby;