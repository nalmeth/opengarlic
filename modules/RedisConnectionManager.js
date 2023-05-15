import { createClient } from "redis";
import { isEmpty } from './Helpers.js';

const clients = {};

/**
 * Build a connection string for redis
 * @param {string} host
 * @param {number} port
 * @param {string} user
 * @param {string} pass
 */
const buildConnectionUrl = (host, port, user, pass) => {
	return 'redis://' +
		(!isEmpty(user) ? `${user}:${pass}@` : '') +
		`${host}:${port}`;
}

/**
 * Creates a redis client, connects and returns it
 * Options:
 * 		name - Name of connection. Required.
 * 		host - Hostname of redis server. Required.
 * 		port - Port of redis server. Required.
 * 		user - Username for connection. Optional.
 * 		pass - Password for connection. Optional.
 * @param {object} options
 * @returns {object}
 */
export const getConnection = async({ name, host, port, user, pass }) => {
	if(isEmpty(name)) throw new Error('Redis connection name required.');

	const hasName = clients.hasOwnProperty(name);
	// Return pre-existing connections
	if(hasName || (hasName && !clients[name]?.connected)) return clients[name];

	const url = buildConnectionUrl(host, port, user, pass);

	// Create client object
	clients[name] = createClient({ url });
	// Attach default events
	clients[name].on('connect', () => console.log(`${name}: Connecting to Redis`));
	clients[name].on('ready', () => {
		console.log(`${name}: Connection to Redis is ready`);
		clients[name].connected = true;
	});
	clients[name].on('reconnecting', () => console.log(`${name}: Client attempting to Reconnect to Redis`));
	clients[name].on('end', () => {
		console.log(`${name}: Disconnected from Redis`);
		clients[name].connected = false;
	});
	clients[name].on('error', (err) => {
		console.error(`${name}: Redis Client Error ${err}`);
		clients[name].connected = false;
	});

	await clients[name].connect();
	return clients[name];
}

/**
 * Get all the client objects in an array
 * @returns {array}
 */
export const getClients = () => Object.values(clients);

/**
 * Quit all client connections
 */
export const quitAll = () => {
	for(const key in clients) clients[key].quit();
}