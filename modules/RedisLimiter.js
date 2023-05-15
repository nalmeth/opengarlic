import { createClient } from "redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Logger from './Logger.js';

const redisConnectionUrl = 'redis://' +
	(
		process.env.REDIS_USER !== undefined && process.env.REDIS_USER !== '' ?
			process.env.REDIS_USER + ':' +
			process.env.REDIS_PASS + '@'
			:
			''
	) +
	process.env.REDIS_HOST + ':' +
	process.env.REDIS_PORT;

Logger.info(`redisConnectionUrl: ${redisConnectionUrl}`)
/**
 * Create Redis Client and set error handler
 */
const redisClient = createClient({
	url: redisConnectionUrl,
	disableOfflineQueue: true
});

redisClient.on('connect', () => Logger.info('Connecting to Redis'));
redisClient.on('ready', () => Logger.info('Connection to Redis is ready'));
redisClient.on('end', () => Logger.info('Disconnected from Redis'));
redisClient.on('error', () => Logger.info('Redis Client Error'));
redisClient.on('reconnecting', () => Logger.info('Client attempting to Reconnect to Redis'));

// redisClient.connect();
(async () => {
	await redisClient.connect();
})();

const options = {
	storeClient: redisClient,
	points: 5,
	duration: 5,
	keyPrefix: 'socklimit'
}

const rateLimiterRedis = new RateLimiterRedis(options);

// example
// rateLimiterRedis.consume(remoteAddress)
// 	.then((rateLimiterRedis) => {

// 	})
// 	.catch((rejRes) => {
// 		if(rejRes instanceof Error) {
// 			// This shouldn't happen
// 			console.error('Some went really wrong');
// 		} else {
// 			const seconds = Math.round(rejRes.msBeforeNext / 1000) || 1;
// 			res.set('Retry-After', String(seconds));
// 			res.status(429).send('Too Many Requests');
// 		}
// 	})
