import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],

	build: {
		// Matches CRA's old output dir, so the Dockerfile/.dockerignore that
		// reference client/build don't need to change.
		outDir: 'build',
	},

	server: {
		port: 3000,
		// Replaces src/setupProxy.js - CRA auto-loaded that file for its
		// dev server; Vite's dev server proxy is configured here instead.
		proxy: {
			'/socket.io': {
				target: process.env.VITE_SOCKET_SERVER,
				changeOrigin: true,
				ws: true
			}
		}
	}
});
