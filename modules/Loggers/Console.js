// export default process.stdout;
import {Writable} from 'stream';

const Console = new Writable({
	async write(chunk, encoding, cb) {
		let data = {};
		try {
			data = JSON.parse(chunk);
		} catch(err) { throw new Error(`Chunk Parse Error: ${err}`); }
		console.log(data?.msg);
		cb();
	}
});

export default Console;