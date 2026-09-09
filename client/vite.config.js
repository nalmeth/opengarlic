import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';

// This codebase uses .js extensions for files containing JSX (App.js,
// DrawingBoard.js, etc.) rather than .jsx - fine under CRA's Babel setup,
// but esbuild (which Vite uses) only treats .jsx/.tsx as JSX-capable by
// default. This wires .js files under src/ through the JSX loader instead
// of renaming every component file.
const loadJsFilesAsJsxPlugin = {
	name: 'load-js-files-as-jsx',
	setup(build) {
		build.onLoad({ filter: /\/src\/.*\.js$/ }, async (args) => ({
			loader: 'jsx',
			contents: await fs.readFile(args.path, 'utf8'),
		}));
	},
};

export default defineConfig({
	plugins: [react()],

	esbuild: {
		loader: 'jsx',
		include: /src\/.*\.jsx?$/,
	},
	optimizeDeps: {
		esbuildOptions: {
			plugins: [loadJsFilesAsJsxPlugin],
		},
	},

	// Keeps the same prefix CRA used (REACT_APP_) so existing .env files,
	// Docker build args, and docs don't need to change.
	envPrefix: 'REACT_APP_',

	build: {
		// Matches CRA's output dir, so the Dockerfile/.dockerignore that
		// reference client/build don't need to change either.
		outDir: 'build',
	},

	server: {
		port: 3000,
		// Replaces src/setupProxy.js - CRA auto-loaded that file for its
		// dev server; Vite's dev server proxy is configured here instead.
		proxy: {
			'/socket.io': {
				target: process.env.REACT_APP_SOCKET_SERVER,
				changeOrigin: true,
				ws: true
			}
		}
	}
});
