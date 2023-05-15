import React, { useEffect, useRef } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Divider, Typography, useMediaQuery } from '@mui/material';

import { useLocalStorage } from './modules/Storage';
import Games from './modules/Games';
import AppScreens from './modules/AppScreens';
import LobbyStatus from './modules/LobbyStatus';

import Login from './components/Login';
import Lobby from './components/Lobby';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css';
import Header from "./components/Header.js";
import GameButton from "./components/widgets/GameButton.js";

/**
 * Main App Component
 * @returns {JSX.Element}
 */
const App = ({ socket }) => {

	// A clean/fresh lobby
	const emptyLobby = Object.freeze({
		code: '',
		owner: '',
		status: LobbyStatus.OPEN,
		appScreen: AppScreens.LOGIN,
		gameScreen: 0,
		round: 1,
		mode: '',
		settings: {},
		players: [],
	});

	// Player Name Input Element
	const [playerName, setPlayerName] = useLocalStorage('playerName', '');

	// Lobby Code Input Element
	const [lobbyCode, setLobbyCode] = useLocalStorage('lobbyCode', '');

	// All the Lobby Data
	const [gameLobby, setGameLobby] = useLocalStorage('gameLobby', emptyLobby);

	// LobbyData storage for games
	const [lobbyData, setLobbyData] = useLocalStorage('lobbyData', {});

	// Used to prevent double rejoin because of receiving a lobby refresh
	// which triggers the useEffect where it would rejoin again.
	const shouldRejoin = useRef(true);

	/**
	 * Game Events & Handlers
	 */
	const events = Object.freeze({
		LobbyCreated: (lobby) => {
			console.log('LobbyCreated');
			setGameLobby(prevLobby => lobby);
		},
		LeftLobby: () => {
			console.log('LeftLobby');
			setGameLobby(prevLobby => emptyLobby);
			setLobbyCode(prevCode => '');
			setLobbyData(prevData => {});
		},
		KickedFromLobby: () => {
			console.log('KickedFromLobby');
			setGameLobby(prevLobby => emptyLobby);
			setLobbyCode(prevCode => '');
			setLobbyData(prevData => {});
		},
		LobbyJoined: (lobby) => {
			console.log('LobbyJoined', lobby);
			setGameLobby(prevLobby => lobby);
		},
		LobbyUpdated: (lobby) => {
			console.log('LobbyUpdated', lobby);
			setGameLobby(prevLobby => lobby);
		},
		LobbyDataUpdate: (lobbyData) => {
			console.log('LobbyDataUpdated');
			setLobbyData(prevData => lobbyData);
		},
		DisconnectPlayer: (reason) => {
			console.log('DisconnectPlayer');
			setLobbyCode(prevCode => '');
			setGameLobby(prevLobby => emptyLobby);
			setLobbyData(prevData => {})
		},
		connect: () => {
			console.log('Connected.');
			if(gameLobby?.code && shouldRejoin.current &&
				 gameLobby?.status !== LobbyStatus.ENDED) {

				shouldRejoin.current = false;
				socket.emit('message', {
					type: 'ReJoinLobby',
					data: {
						playerName,
						lobbyCode: gameLobby.code,
					}
				});
			}
		},
		connect_error: (err) => console.error(err),
		disconnect: (reason, details) => {
			console.log('Disconnected');
			console.warn(reason, details);
		},
		pong: () => {
			console.log('PONG ', new Date().toISOString());
		},
		error: (err) => {
			console.log('Error from server:');
			setLobbyCode(prevCode => '');
			setGameLobby(prevLobby => emptyLobby);
			setLobbyData(prevData => {});
			console.error(err);
		}
	});

	/**
	 * On Init, setup our socket object
	 */
	useEffect(() => {
		console.log('Attach App Events');
		for(const name in events) {
			socket.on(name, events[name]);
		}

		return () => {
			console.log('Detach App Events');
			for(const name in events) {
				socket.off(name, events[name]);
			}
		}
		// eslint-disable-next-line
	}, []);

	const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));

	// If no game modes are loaded
	if(!Games.length) return (<Typography>No Game Modes found</Typography>);

	// Default to first mode
	let GameModeComponent = Games[0].default;
	if(gameLobby.appScreen === AppScreens.GAME && gameLobby?.mode) {
		const idx = Games.findIndex(mode => mode.title === gameLobby.mode);
		if(idx === -1) return (<Typography>Invalid Game Mode</Typography>);
		GameModeComponent = Games[idx].default;
	}

	/**
	 * Handles Quit Event
	 */
	const handleQuit = () => {
		console.log('App quit.');

		setGameLobby(prevLobby => emptyLobby);
		setLobbyCode(prevCode => '');
		setLobbyData(prevData => {});

		console.log('Emit QuitLobby');
		socket.emit('message', {
			type: 'QuitLobby',
			data: {
				playerName,
				lobbyCode: gameLobby.code
			}
		});
	}

	// const isXS = useMediaQuery(theme => theme.breakpoints.only('xs'));
	// const isSM = useMediaQuery(theme => theme.breakpoints.only('sm'));
	// const isMD = useMediaQuery(theme => theme.breakpoints.only('md'));
	// const isLG = useMediaQuery(theme => theme.breakpoints.only('lg'));
	// const isXL = useMediaQuery(theme => theme.breakpoints.only('xl'));
	// console.log('xs',isXS,'sm',isSM,'md',isMD,'lg',isLG,'xl',isXL);

	return (
		<>
		<Header	gameLobby={gameLobby} />
		<Divider light />

		<Grid
			container
			spacing={0}
			justifyContent="center"
			mb={5}
			mt={isSmall ? 0 : 3}
		>
			{(gameLobby.appScreen === AppScreens.LOGIN) &&
				<Login
					playerName={playerName}
					onNameChange={newName => setPlayerName(prevName => newName)}
					onCreateClick={() => {
						console.log('Create Lobby');
						socket.emit('message', {
							type: 'CreateLobby',
							data: {
								playerName,
								appScreen: AppScreens.LOBBY
							}
						});
					}}
					lobbyCode={lobbyCode}
					onCodeChange={newCode => setLobbyCode(prevCode => newCode)}
					onJoinClick={() => {
						console.log('Join Lobby');
						socket.emit('message', {
							type: 'JoinLobby',
							data: {
								playerName,
								lobbyCode
							}
						});
					}}
				/>
			}

			{(gameLobby.appScreen === AppScreens.LOBBY) &&
				<>
				<Grid
					container
					direction="column"
					xs={12} sm={12} md={12} lg={9} xl={7}
				>
					<GameButton color="error" onClick={handleQuit}>Leave</GameButton>
					<Grid
						container
						direction="row"
					>
						<Lobby
							{...gameLobby}
							playerName={playerName}
							onModeSelect={(mode, settings) => {
								socket.emit('message', {
									type: 'StartGame',
									data: {
										lobbyCode: gameLobby?.code,
										mode,
										appScreen: AppScreens.GAME,
										settings
									}
								});
							}}
							onPlayerKick={(code, playerName) => {
								socket.emit('message', {
									type: 'KickLobby',
									data: {
										playerName,
										lobbyCode: code
									}
								});
							}}
						/>
					</Grid>
				</Grid>
				</>
			}

			{(gameLobby.appScreen === AppScreens.GAME) &&
				<GameModeComponent
					{...gameLobby}
					socket={socket}
					playerName={playerName}
					lobbyData={lobbyData}
					onGameEnd={() => {
						console.log('Game End');
						socket.emit('message', {
							type: 'EndGame',
							data: {
								lobbyCode: gameLobby.code
							}
						});
					}}
					onRoundEnd={() => {
						console.log(`End of Round: ${gameLobby.round}`);
					}}
					onDone={(playerData) => {
						socket.emit('message', {
							type: 'DonePlayer',
							data: {
								playerName,
								lobbyCode: gameLobby.code,
								playerData
							}
						});
					}}
					onQuit={handleQuit}
				/>
			}
		</Grid>
		</>
	);
}
// App.whyDidYouRender = {
// 	logOnDifferentValues: true,
// 	customName: 'App'
// };
export default App;
