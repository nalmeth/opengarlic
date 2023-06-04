import { useEffect } from 'react';
import Socket from "./Socket.js";

export const useSocketEvents = (events) => {
	useEffect(() => {
		// console.log('Attach Standard Events');
		for(const name in events) {
			Socket.on(name, events[name]);
		}

		return () => {
			// console.log('Detach Standard Events');
			for(const name in events) {
				Socket.off(name, events[name]);
			}
		}
		// eslint-disable-next-line
	}, []);
}
