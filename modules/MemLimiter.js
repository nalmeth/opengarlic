import { RateLimiterMemory } from 'rate-limiter-flexible';

const MemLimiter = new RateLimiterMemory(
	{
		points: process.env.MEM_LIMIT_POINTS,
		duration: process.env.MEM_LIMIT_DURATION // per second
	}
);

export default MemLimiter;