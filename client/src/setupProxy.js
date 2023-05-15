const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
	const socketProxy = createProxyMiddleware('/socket.io',{
		target: process.env.REACT_APP_SOCKET_SERVER,
		changeOrigin: true,
		ws: true
	});
	app.use(socketProxy);
}