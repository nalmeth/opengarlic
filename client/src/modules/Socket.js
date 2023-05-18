import { io } from "socket.io-client";

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER;

// console.log(`Connecting to: ${SOCKET_SERVER}`);

const Socket = io(
	SOCKET_SERVER,
	{
		// autoConnect: false,
		// transports: ['websocket', 'polling'],
		closeOnBeforeunload: true,
		reconnectionAttempts: 3
	}
);

Socket.io.on('reconnect', (attempts) => console.log('Reconnected after ', attempts, ' attempts'));
Socket.io.on('reconnect_attempt', (attempt) => console.log('Recon Attempt', attempt));
Socket.io.on('reconnect_error', (err) => console.log('Recon Err', err));
Socket.io.on('reconnect_failed', () => console.log('Unable to re-establish connection to server.'));

export default Socket;

// socket.io.on('reconnect_error', (err) => console.log('Reconnect error: ', err));
// socket.io.on('reconnect_failed', () => console.log('Reconnection attempts have failed.'));