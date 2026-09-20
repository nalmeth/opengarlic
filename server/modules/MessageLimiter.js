import { RateLimiterMemory } from 'rate-limiter-flexible';

// Deliberately more generous than the connection-level limiter (MemLimiter) -
// normal gameplay only sends occasional, per-turn socket messages (not
// per-mousemove; drawing itself stays local until a round is submitted), so
// this only needs to catch sustained spam/abuse, not throttle real play.
const MessageLimiter = new RateLimiterMemory(
	{
		points: Number(process.env.MESSAGE_LIMIT_POINTS),
		duration: Number(process.env.MESSAGE_LIMIT_DURATION) // per second
	}
);

export default MessageLimiter;
