/**
 * Lobby Status constants
 */
export const LobbyStatus = Object.freeze({
	OPEN: 'open',
	STARTED: 'started',
	ENDED: 'ended'
});

/**
 * Player Status constants.
 * Whether a player has finished their current turn/round.
 * For whether a player is still connected, see ConnectionStatus.
 */
export const PlayerStatus = Object.freeze({
	ACTIVE: 'active',
	DONE: 'done'
});

/**
 * Connection Status constants.
 * Whether a player's socket is currently connected.
 */
export const ConnectionStatus = Object.freeze({
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected'
});
