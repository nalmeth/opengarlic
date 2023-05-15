import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from "path";
import http from 'http';
import httpProxy from 'http-proxy';

import { fileURLToPath } from "url";
import logger from 'morgan';

/**
 * Recreate these constants for use in ES Modules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 85;
const app = express();
const proxyServer = http.createServer(app);
const proxy = httpProxy.createProxyServer({
	target: `http://backend:3001`
});

app.use(helmet(
	{
	contentSecurityPolicy: {
		directives: {
			"default-src": ["'self'","http://localhost"],
			"connect-src": ["'self'","http://localhost","ws://localhost"],
			"script-src": ["'self'","http://localhost"]
		}
	}
}
));
app.use(cors());
app.use(logger('dev'));

proxy.on('error', err => console.error(err));
proxy.on('proxyReq', (proxyReq, req, res) => {
	console.log('Proxy Request', proxyReq.path);
});
proxy.on('proxyReqWs', (proxyReqWs, req, res) => {
	console.log('Proxy WS Request', proxyReqWs.path);
});

// Serve adminui files
app.use(express.static(path.join(__dirname, 'admin')));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Handle polling request
app.use('/socket.io', (req, res) => {
	proxy.web(req, res, { target: 'http://backend:3001/socket.io'});
});

// Handle request upgrades
proxyServer.on('upgrade', (req, socket, head) => {
	console.log('Socket Upgrade');
	proxy.ws(req, socket, head);
});

// Start the server listening
proxyServer.listen(PORT, err => {
	if(err) console.error(err);
	console.log(`AdminUI listening on ${PORT}`);
});