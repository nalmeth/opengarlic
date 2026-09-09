import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import http from 'http';
import path from 'path';
import { fileURLToPath } from "url";
import { Server } from 'socket.io';
import { instrument, RedisStore } from "@socket.io/admin-ui";
import { getConnection, quitAll } from './modules/RedisConnectionManager.js';
import IPMemLimit from "./modules/Middleware/IPMemLimit.js";
import Logger from "./modules/Logger.js";
import GameEventEmitter from './modules/GameEventEmitter.js';
import './modules/GameEvents.js';
import { trim } from "./modules/Helpers.js";

/**
 * Recreate these constants for use in ES Modules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROD_ENV = 'production';
// Default to production mode
process.env.NODE_ENV = process.env.NODE_ENV || PROD_ENV;

Logger.info(`Running ${process.env.NODE_ENV} environment.`);

/**
 * Register handlers to clean up redis connections on exit
 */
const connectionCleanup = async() => { quitAll(); process.exit(1); }
process.on('SIGINT', connectionCleanup);
process.on('SIGTERM', connectionCleanup);
// process.on('SIGBREAK', connectionCleanup);
// process.on('SIGHUP', connectionCleanup);

// Assign the port the server will listen on
let SOCKET_SERVER = null;
try {
	SOCKET_SERVER = new URL(process.env.REACT_APP_SOCKET_SERVER);
} catch(err) {
	Logger.error('SOCKET_SERVER env var is misconfigured. Please check your .env file.');
	process.exit(1);
}

// Create our express app
const app = express();
app.use(helmet());
app.use(cors());

// Create node http server wrapping express app
const httpServer = http.createServer(app);

// Import list of origins from environment
const origin = trim(process.env.CORS,'"')
				.split(',').map(item => item.trim());

// Create WebSocket Server and only allow connections from configured host
const io = new Server(httpServer, {
	cors: { origin, credentials: true },
});

// Attach AdminUI instrumentation
instrument(io, {
	auth: false,
	mode: process.env.NODE_ENV,
	store: new RedisStore(async() => await getConnection('game'))
});

/**
 * Rate Limit WebSocket Middleware
 */
io.use(IPMemLimit);


// Handle client connection
io.on('connection', (socket) => {

	Logger.info(`Client Connect. Socket: ${socket.id} ${socket.handshake.address}`);

	// Handle Game Messages
	socket.on('message', (message) => {
		GameEventEmitter.emit(
			message.type,
			io, socket,
			message.data
		);
	});

	// Don't need this, for now
	// socket.on('disconnecting', (reason, details) => {});

	// Handle client disconnect event
	socket.on('disconnect', (reason, details) => {
		GameEventEmitter.emit(
			'DisconnectPlayer',
			io, socket,
			{reason, details}
		);
	});

});

// Don't need this, for now
// io.on('new_namespace', (namespace) => { Logger.info(`New Namespace ${namespace}`) });

// Report Connection Errors
io.engine.on('connection_error', (err) => {
	Logger.warn(
		err.req + ' '
		+ err.code + ' '
		+ err.message + ' '
		+ err.context
	);
});

// Don't need these, for now
// Handshake
// io.engine.on('initial-headers', (headers, request) => {});
// Every request
// io.engine.on('headers', (headers, request) => {});

// Start the server listening
const PORT = SOCKET_SERVER?.port || 3001;
httpServer.listen(PORT, err => {
	if(err) {
		Logger.error(err);
		return;
	}
	Logger.info(`Server running on ${PORT}`);
});