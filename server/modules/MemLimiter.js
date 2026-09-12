import { RateLimiterMemory } from 'rate-limiter-flexible';

const MemLimiter = new RateLimiterMemory(
	{
		// process.env values are always strings - RateLimiterMemory validates
		// with Number.isFinite, which does not coerce strings, so these must
		// be converted explicitly or it throws even with valid-looking values.
		points: Number(process.env.MEM_LIMIT_POINTS),
		duration: Number(process.env.MEM_LIMIT_DURATION) // per second
	}
);

export default MemLimiter;