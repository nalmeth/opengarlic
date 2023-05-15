import { getConnection } from "../RedisConnectionManager.js";
import { Writable } from 'stream';
import { nanoid } from "nanoid";
import { isEmpty, isPositiveNumber } from "../Helpers.js";

// Skip connecting if we aren't logging to redis
const redisClient = await getConnection({
	name: 'log',
	host: isEmpty(process.env.REDIS_LOG_HOST) ?
		process.env.REDIS_HOST : process.env.REDIS_LOG_HOST,
	port: isEmpty(process.env.REDIS_LOG_PORT) ?
		process.env.REDIS_PORT : process.env.REDIS_LOG_PORT,
	user: isEmpty(process.env.REDIS_LOG_USER) ?
		process.env.REDIS_USER : process.env.REDIS_LOG_USER,
	pass: isEmpty(process.env.REDIS_LOG_PASS) ?
		process.env.REDIS_PASS : process.env.REDIS_LOG_PASS,
});

// Default 0 = No Expire
const autoExpire = {
	trace: 0,
	debug: 0,
	info: 0,
	warn: 0,
	error: 0,
	fatal: 0
}

// Load configured logging level auto expire times
const envLevels = process.env.LOG_REDIS_EXPIRE_LEVELS.split(',');
let envLevel=false, envExp=false;
for(const level of envLevels) {
	[envLevel, envExp] = level.split('=');
	autoExpire[envLevel] = envExp;
}

const RedisLogger = new Writable({
	async write(chunk, encoding, cb) {
		let data = {};
		let expire = 0;
		let logKey = '';
		try {
			data = JSON.parse(chunk);
		} catch(err) { throw new Error(`Chunk Parse Error: ${err}`); }
		data.key = nanoid();
		try {
			expire = Object.hasOwn(data, 'expire')
						&& isPositiveNumber(data.expire) ?
							expire = data.expire : autoExpire[data.level];

			logKey = `log:${data.level}:${data.key}`;
			// Trim down what we save for storage savings
			// level and key are already part of the logKey
			delete data.expire;
			delete data.level;
			delete data.key;

			await redisClient.json.set(logKey, '$', data);

			if(expire) await redisClient.expire(logKey, expire);

		} catch(err) { throw new Error(`Redis Logging Error: ${err}`); }
		cb();
	}
});

export default RedisLogger;