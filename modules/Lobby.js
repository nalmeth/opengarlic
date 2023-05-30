import { getConnection } from './RedisConnectionManager.js';
import Logger from './Logger.js';
import { mergeDeep } from './Helpers.js';
import { PlayerStatus } from './PlayerStatus.js'
import { LobbyStatus } from "./LobbyStatus.js";
import { ConnectionStatus } from "./ConnectionStatus.js";

/**
 * INTERNAL
 * Configure Nanoid to give us 6 character alphanumeric
 * keys for the lobby code (players enter this to join the lobby)
 * Supposedly would take 1 day at 1000 ids/hr for a 1% chance of collision.
 * After a game, the key is dumped, and can then be reused, so this should be fine.
 */
import { customAlphabet } from "nanoid";
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);


/**
 * Lobby Object model
 *
 * lobby:code {
 * 		code: string				Unique lobby code
 * 		owner: string,				Name of player who currently owns the lobby
 * 		status: string,				Lobby status
 * 		appScreen: string,			Screen the application is showing defined on front-end
 * 		gameScreen: number,		Game screen being shown (if appscreen is game)
 * 		round: number,				Current round number in the game
 * 		mode: string,				Current game mode
 * 		settings: {}				Current game settings
 * 		players: [{					List of players
 * 			name: string,				Player Name
 * 			owner?: bool,				True/False if lobby owner
 * 			status: string,				Player Status
 * 		}]
 * }
 *
 */
const redisClient = await getConnection({
	name: 'game',
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	user: process.env.REDIS_USER,
	pass: process.env.REDIS_PASS
});
export const cleanup = async () => await redisClient.quit();

/**
 * Creates a lobby in Redis
 * @param {string} owner Player name
 * @param {string} appScreen Starting screen
 * @returns {object|null} Lobby object, null on error
 */
export const create = async (owner, appScreen) => {
	Logger.info(`Lobby->Create: ${owner}`);
	let lobby = null;
	const TIMEOUT = process.env.REDIS_LOBBY_EXPIRE_TIMEOUT || 21600;
	try {

		const lobbyCode = nanoid();
		const lobbyKey = `lobby:${lobbyCode}`;

		lobby =  {
			code: lobbyCode,
			owner,
			status: LobbyStatus.OPEN,
			appScreen,
			gameScreen: 0,
			round: 1,
			mode: '',
			settings: {},
			players: [
				{
					name: owner,
					owner: true,
					status: PlayerStatus.ACTIVE,
					connected: ConnectionStatus.CONNECTED
				}
			]
		};

		// Store the lobby in redis
		await redisClient.json.set(lobbyKey, '$', lobby);
		await redisClient.expire(lobbyKey, TIMEOUT);

		// Create a general use data store for the lobby
		await redisClient.json.set(`lobby:${lobbyCode}:data`, '$', {});
		await redisClient.expire(`lobby:${lobbyCode}:data`, TIMEOUT);

		await redisClient.json.set(`lobby:${lobbyCode}:bans`, '$', []);
		await redisClient.expire(`lobby:${lobbyCode}:bans`, TIMEOUT);

	} catch(err) {
		Logger.error(err);
		lobby = null;
	}

	return lobby;
}

/**
 * Add a player to the lobby
 * @throws {Error}
 * @param {string} playerName Player requesting join
 * @param {string} lobbyCode Lobby to join
 * @returns {object|null} Lobby object
 */
export const join = async (playerName, lobbyCode) => {
	Logger.info(`Lobby->Join: ${playerName} ${lobbyCode}`);

	let lobby = await get(lobbyCode);
	if(lobby === null) throw new Error(`Invalid Lobby ${lobbyCode}`);

	// Find player in lobby
	const idx = lobby.players.findIndex(
		player => player.name.toLowerCase() === playerName.toLowerCase()
	);

	// If lobby has ended
	if(lobby.status === LobbyStatus.ENDED) {

		// if player is not in list, deny
		if(idx === -1) {
			throw new Error(`Lobby ${lobbyCode} has ended.`);
		}

	}

	// If player is not in list, check availibility and add
	if(idx === -1) {
		if(lobby.status === LobbyStatus.STARTED) {
			throw new Error(`Lobby ${lobbyCode} has started. No new players allowed`);
		}

		const playerCount = parseInt(lobby?.players.length);
		const mp = parseInt(lobby?.settings?.maxPlayers);
		const maxPlayers = isNaN(mp) ? 15 : mp;

		// Don't exceed max players
		if(playerCount === maxPlayers) {
			throw new Error(`Lobby ${lobbyCode} is full.`);
		}

		const playerNames = lobby.players.map((player) => player.name.toLowerCase());
		// Don't allow duplicate player names
		if(playerNames.includes(playerName.toLowerCase())) {
			throw new Error(`Player ${playerName} already exists in lobby ${lobbyCode}`);
		}

		const newPlayer = {
			name: playerName,
			owner: false,
			status: PlayerStatus.ACTIVE,
			connected: ConnectionStatus.CONNECTED
		}

		await redisClient.json.arrAppend(
			`lobby:${lobbyCode}`,
			'.players',
			newPlayer
		);

	} else {

		// This should be a rejoining player, mark them as connected again
		if(lobby.players[idx].connected === ConnectionStatus.DISCONNECTED) {
			await redisClient.json.set(
				`lobby:${lobbyCode}`,
				`.players[${idx}].connected`,
				ConnectionStatus.CONNECTED
			);
		}

	}

	return await get(lobbyCode);
}

/**
 * Start a lobby
 * @param {string} lobbyCode Lobby Code
 * @param {string} mode Game Mode
 * @param {string} appScreen Game Screen
 * @param {object} settings Game Settings
 * @returns {object|null} Lobby object, null on error
 */
export const start = async (lobbyCode, mode, appScreen, settings) => {
	Logger.info(`Lobby->Start: ${lobbyCode} ${mode}`);
	const lobbyKey = `lobby:${lobbyCode}`;
	let lobby = null;
	try {

		// Pipeline
		await Promise.all([
			redisClient.json.set(lobbyKey, '.status', LobbyStatus.STARTED),
			redisClient.json.set(lobbyKey, '.mode', mode),
			redisClient.json.set(lobbyKey, '.appScreen', appScreen),
			redisClient.json.set(lobbyKey, '.gameScreen', 0),
			redisClient.json.set(lobbyKey, '.round', 0),
			redisClient.json.set(lobbyKey, '.settings', settings)
		]);

		lobby = await get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		lobby = null;
	}
	return lobby;
}

/**
 * Player is done on current game screen
 * @param {string} playerName Player Name
 * @param {string} lobbyCode Lobby code
 * @param {object} playerData Game Screen data
 * @returns {object|null} Lobby object, null on error
 */
export const done = async(playerName, lobbyCode, playerData) => {
	Logger.info(`Lobby->Done: ${playerName} ${lobbyCode}`);
	let lobby = null;
	try {

		let players = await getPlayers(lobbyCode);

		players = players.map((player) => {
			// Return modified data if matching player
			return player.name === playerName ?
				{...player,	status: PlayerStatus.DONE}
				: player;
		});

		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', players);

		lobby = await get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		lobby = null;
	}
	return lobby;
}

/**
 * Remove a player from the lobby
 * @param {string} playerName Player name
 * @param {string} lobbyCode Lobby code
 * @returns {object|null} Lobby object, null on error
 */
export const leave = async (playerName, lobbyCode) => {
	Logger.info(`Lobby->Leave: ${playerName} ${lobbyCode}`);
	playerName = playerName.toLowerCase();

	try {

		let players = await getPlayers(lobbyCode);
		if(!players) return;

		players = players.filter(player => player.name.toLowerCase() !== playerName);

		// Update players in db
		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', players);

		// Return a fresh fetch of the lobby
		return await get(lobbyCode);

	} catch(err) {

		Logger.error(err);
		return null;
	}
}

/**
 * Delete the lobby and all it's data
 * @param {string} lobbyCode
 * @return {boolean} Success in destroying the lobby
 */
 export const destroy = async (lobbyCode) => {
	Logger.info(`Lobby->Destroy: ${lobbyCode}`);
	let success = false;
	try {

		await redisClient.json.del(`lobby:${lobbyCode}`, '$');
		await redisClient.json.del(`lobby:${lobbyCode}:data`);
		success = true;

	} catch(err) {
		Logger.error(err);
		success = false;
	}
	return success;
}

/**
 * Moves Lobby to the next game screen
 * @param {string} lobbyCode
 * @returns {object|null} Lobby object, null on error
 */
export const nextScreen = async (lobbyCode) => {
	Logger.info(`Lobby->nextScreen ${lobbyCode}`);
	let lobby = null;
	try {

		lobby = await get(lobbyCode);

		// Set all connected players back to active
		const newPlayers = lobby.players.map((player) => {
			if(player.connected === ConnectionStatus.DISCONNECTED) {
				return player;
			}
			player.status = PlayerStatus.ACTIVE;
			return player;
		});

		// Advance the gamescreen counter and update the players
		await redisClient.json.numIncrBy(`lobby:${lobbyCode}`, '.gameScreen', 1);
		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', newPlayers);

		lobby = await get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		lobby = null;
	}
	return lobby;
}

/**
 * Moves game to the next round
 * @param {string} lobbyCode
 * @returns {object|null} Lobby object, null on error
 */
export const nextRound = async (lobbyCode) => {
	Logger.info(`Lobby->nextRound ${lobbyCode}`);
	let lobby = null;
	try {

		await redisClient.json.numIncrBy(`lobby:${lobbyCode}`, '.round', 1);

		lobby = await get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		lobby = null;
	}
	return lobby;
}

/**
 * Get the lobby data
 * @param {string} lobbyCode Code for the lobby
 * @returns {object|null} Lobby object, null on error
 */
 export const get = async (lobbyCode) => {
	// Logger.info(`Lobby->Get: ${lobbyCode}`);
	let lobby = null;
	try {
		lobby = await redisClient.json.get(`lobby:${lobbyCode}`, {path:['.']});
	} catch(err) {
		Logger.error('Lobby->get error', err);
	}
	return lobby;
}

/**
 * Get the owner of the lobby
 * @param {string} lobbyCode
 * @returns {string} Owner name
 */
 export const getOwner = async (lobbyCode) => {
	Logger.info(`Lobby->getOwner: ${lobbyCode}`);
	let owner = '';
	try {

		owner = await redisClient.json.get(`lobby:${lobbyCode}`, {path: ['.owner']});

	} catch(err) {
		Logger.error(err);
		owner = '';
	}
	return owner;
}

/**
 * Set the lobby owner to a player
 * @param {string|null} player Player name or null for first available
 * @param {string} lobbyCode
 * @returns {object|null} Lobby object, null on error
 */
export const setOwner = async (playerName, lobbyCode) => {
	Logger.info(`Lobby->setOwner: ${playerName} ${lobbyCode}`);

	try {

		const players = await getPlayers(lobbyCode);
		if(!players || players.length < 1) {
			Logger.info('No player available to become owner.');
			return null;
		}

		// Clear any existing players as owner
		let newPlayers = [];

		let newOwner = playerName !== null ? playerName.toLowerCase() : null;

		// If null was supplied for the name, default to first available player
		if(newOwner === null) {
			// Set first available player as the owner
			newPlayers = players.map((player, idx) => {
				if(player.connected !== ConnectionStatus.DISCONNECTED) {
					newOwner = player.name;
					return {
						...player,
						owner: true
					}
				}
				return {
					...player,
					owner: false
				};
			});

		} else {
			// Find the player
			const playerIndex = players.findIndex(
				player => player.name.toLowerCase() === newOwner
			);

			if(playerIndex === -1) {
				Logger.warn(`Player ${newOwner} does not exist in ${lobbyCode}`);
				return null;
			}

			// Remove player from list, set as owner.
			const playerOwner = {
				...players[playerIndex],
				owner: true
			};

			// Move to the top of the list, so they appear first
			// newPlayers.unshift(playerOwner);
			newPlayers = players
					.filter(player => player.name.toLowerCase() !== newOwner)
					.map(player => ({...player, owner: false}))
					.unshift(playerOwner);
		}

		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', newPlayers);
		await redisClient.json.set(`lobby:${lobbyCode}`, '.owner', newOwner);

		return await get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		return null;
	}
}

/**
 * Get players in the lobby
 * @param {string} lobbyCode
 * @returns {Array} Player list
 */
 export const getPlayers = async (lobbyCode) => {
	let players = [];
	// Logger.info(`Lobby->getPlayers: ${lobbyCode}`);
	try {

		players = await redisClient.json.get(`lobby:${lobbyCode}`, {path: ['.players']});

	} catch(err) {
		Logger.error(err);
		players = [];
	}
	return players;
}

/**
 * Get a Player Object
 * @param {string} playerName
 * @param {string} lobbyCode
 * @returns {object|null} Player object, null on error
 */
export const getPlayer = async (playerName, lobbyCode) => {
	// Logger.info(`Lobby->getPlayer: ${playerName} ${lobbyCode}`);
	let player = null;
	try {

		player = await redisClient.json.get(`lobby:${lobbyCode}`,
			{
				path: [`.players[?(@.name=='${playerName}')]`]
			}
		);

	} catch(err) {
		Logger.error(err);
		player = null;
	}
	return player;
}

/**
 * Update a single player in the lobby
 * @param {string} lobbyCode
 * @param {string} playerName
 * @param {object} playerObject
 * @returns {boolean} Succes of operation
 */
export const setPlayer = async (lobbyCode, playerName, playerObject) => {
	try {

		const lobby = await get(lobbyCode);
		const newPlayers = lobby.players.map((player) => {
			if(player.name !== playerName) return player;
			return playerObject;
		});

		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', newPlayers);

	} catch(err) {
		Logger.error(err);
		return false;
	}

	return true;
}

/**
 * Set all the lobby players
 * @param {string} lobbyCode
 * @param {array} newPlayers
 * @returns {object}
 */
export const setPlayers = async (lobbyCode, newPlayers) => {

	let lobby = await get(lobbyCode);

	try {

		await redisClient.json.set(`lobby:${lobbyCode}`, '.players', newPlayers);

		lobby = await get(lobbyCode);

	} catch(err) {

		Logger.error(err);
		return null;
	}

	return lobby;
}

/**
 * Data to merge into existing lobby data
 * @param {string} lobbyCode
 * @param {object} newLobbyData
 * @returns {boolean} Success of operation
 */
export const setLobbyData = async (lobbyCode, newLobbyData) => {
	try {
		const oldLobbyData = await getLobbyData(lobbyCode);
		const newLobbyObj = mergeDeep(oldLobbyData, newLobbyData);
		await redisClient.json.set(`lobby:${lobbyCode}:data`, '$', newLobbyObj);
	} catch(err) {
		Logger.error(err);
		return false;
	}
	return true;
}

/**
 * Get the existing lobby data
 * @param {string} lobbyCode
 * @returns {object|null}
 */
export const getLobbyData = async (lobbyCode) => {
	let lobbyData = null;
	try {
		lobbyData = await redisClient.json.get(`lobby:${lobbyCode}:data`);
	} catch(err) {
		Logger.error(err);
		return null;
	}
	return lobbyData;
}

/**
 * Set lobby status to game end
 * @param {string} lobbyCode
 * @returns {object|null}
 */
export const endGame = async (lobbyCode) => {
	let lobby = null;
	try {
		await redisClient.json.set(`lobby:${lobbyCode}`, '.status', LobbyStatus.ENDED);
		lobby = await get(lobbyCode);
	} catch(err) {
		Logger.error(err);
		return null;
	}
	return lobby;
}

/**
 * Ban a player from the lobby
 * @param {string} lobbyCode
 * @param {string} playerAddress
 */
export const banPlayer = async (lobbyCode, playerAddress) => {
	let lobby = null;

	try {

		const bans = await redisClient.json.get(`lobby:${lobbyCode}:bans`, { path: [`.`] });

		let newBans = [...bans];
		if(!bans.includes(playerAddress)) {
			newBans.push(playerAddress);
		}

		await redisClient.json.set(`lobby:${lobbyCode}:bans`, '$', newBans);
		lobby = get(lobbyCode);

	} catch(err) {
		Logger.error(err);
		return null;
	}

	return lobby;
}

/**
 * Returns the addresses banned from the lobby
 * @param {string} lobbyCode
 * @returns
 */
export const getBans = async (lobbyCode) => {
	try {

		const bans = await redisClient.json.get(`lobby:${lobbyCode}:bans`, { path: [`.`] });

		return bans;

	} catch(err) {
		Logger.error(err);
		return [];
	}
}