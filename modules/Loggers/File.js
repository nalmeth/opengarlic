import pino from "pino";
import path from 'path';

export default pino.destination({
	dest: path.resolve(process.env.LOG_FILE_PATH),
	append: true,
	sync: true
});