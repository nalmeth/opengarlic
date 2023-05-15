import MemLimiter from "../MemLimiter.js";
/**
 * Simple in-memory rate limiter based on user ip
 * @param {object} socket
 * @param {function} next
 */
const IPMemLimit = async (socket, next) => {
	try {
		await MemLimiter.consume(socket.handshake.address);
		next();
	} catch(rejRes) {
		socket.emit('error', {
			type: 'rate-limit',
			message: { 'retry-ms': rejRes.msBeforeNext }
		});
		next(new Error('Rate Limit Reached'));
	}
}

export default IPMemLimit;