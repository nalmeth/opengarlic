import * as Lobby from '../Lobby.js';
import Logger from '../Logger.js';

/**
 * Round End Event
 * @param {object} io Server Object
 * @param {object} socket Socket Object
 * @param {object} data Event Object
 */
const EndGameRound = async (io, socket, data) => {

	Logger.info(`End Game Round ${data.lobbyCode}`);

	try {

		const lobby = await Lobby.nextRound(data.lobbyCode);
		io.in(data.lobbyCode).emit('GameRoundEnded', lobby);

	} catch(err) {
		socket.emit('error', {
			type: 'EndGameRound',
			message: err.message
		});
	}
}

export default EndGameRound;