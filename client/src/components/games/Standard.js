import React, { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import GameButton from "../widgets/GameButton.js";
import Screen0 from "../screens/Standard/Screen0.js";
import Screen1 from "../screens/Standard/Screen1.js";
import Screen2 from "../screens/Standard/Screen2.js";
import StdEndGame from "../screens/Standard/EndGame.js";
import PlayerStatus from "../../modules/PlayerStatus.js";
import GameNumericInput from "../widgets/GameNumericInput.js";


/**
 * Standard Game mode
 *
 * Players enter a phrase, then draw, then guess the drawing
 * as it rotates around. Players shown the series of phrases drawings
 * in sequence based on who started each.
 *
 * props:
 * 		gameScreen: number		- The current game screen
 * 		players: array			- List of player data
 * 		onChange: function		- Callback for when data changes
 * 		onDone: function		- Callback for when a player is done
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
const Standard = ({
		code,
		owner,
		status,
		appScreen,
		gameScreen,
		round,
		mode,
		settings,
		players,
		socket,
		playerName,
		lobbyData,
		onGameEnd,
		onRoundEnd,
		onDone,
		onQuit
	}) => {
	// Max Canvas Size
	const MAX_WIDTH = 1000;
	const MAX_HEIGHT = 600;

	// State flag for player being done with their screen
	const [isDone, setIsDone] = useState(()=>{
		for(const player of players) {
			// Load done state from lobby
			if(player.name === playerName)
				return player.status === PlayerStatus.DONE;
		}
	});

	// Flag to not repeat next screen event
	const shouldMoveNext = useRef(true);
	// Flag to not repeat end game
	const shouldEnd = useRef(true);
	// Reference to the stage object
	const stageRef = useRef(null);

	// Determine the index of the screen to show.
	// Based on the game screen.
	let screenIndex = 0;
	switch(gameScreen) {
		case 0:
		case 1:
		case 2:
			screenIndex = gameScreen;
			break;
		default:
			screenIndex = gameScreen % 2 === 0 ? 2 : 1;
			break;
	}

	const playerCount = players?.length || 0;

	// Get index of the player in the player list
	const playerIndex = players
		.findIndex(player => player.name === playerName);

	// Single player, have both text & drawing screen
	// Multiplayer, end on screen equal to number of players
	const endGame = playerCount === 1 ?
		gameScreen === 2 : gameScreen === playerCount;

	// If we reached end game and this is the lobby owner,
	// emit end game event.
	if(owner === playerName && endGame && shouldEnd.current) {
		shouldEnd.current = false;
		socket.emit('message', {
			type: 'EndGame',
			data: { lobbyCode: code }
		});
	}

	/**
	 * Standard Events object
	 */
	const events = Object.freeze({
		PlayersDone: (lobby, lobbyData) => {
			// console.log('All Players Done', shouldMoveNext.current);
			if(!shouldMoveNext.current) return;
			// console.log('Moving next');
			shouldMoveNext.current = true;
			const newData = prepareLobbyData(lobby, lobbyData);

			socket.emit('message', {
				type: 'NextScreen',
				data: {
					lobbyCode: lobby.code,
					lobbyData: newData
				}
			});
		},
		NextScreen: (lobby) => {
			setIsDone(prevDone => false);
		}
	});

	/**
	 * Returns lobby data with blank entries
	 * for missing players to ensure consistent
	 * lobby data.
	 * @param {object} lobby
	 * @param {object} data
	 * @returns {object}
	 */
	const prepareLobbyData = (lobby, data) => {
		let newData = {};
		for(const player of lobby.players) {
			if(!data.hasOwnProperty(player.name)) {
				newData[player.name] = [];
				data[player.name] = [];
			}
			if(!data[player.name][lobby.gameScreen]) {
				newData[player.name] = [{name: '',	value: ''}];
			}
		}
		return newData;
	}

	/**
	 * Attach Standard mode events
	 */
	useEffect(() => {
		// console.log('Attach Standard Events');
		for(const name in events) {
			socket.on(name, events[name]);
		}

		return () => {
			// console.log('Detach Standard Events');
			for(const name in events) {
				socket.off(name, events[name]);
			}
		}
		// eslint-disable-next-line
	}, []);


	/**
	 * Handle Done Event
	 * @param {string} playerName Player Name
	 * @param {string} data Text Data from inputs
	 */
	const handleDone = (playerName, data) => {

		let saveData = null;

		// Re-scale canvas before saving image
		if(screenIndex === 1) {
			if(stageRef.current === null) throw new Error('Error saving image. No stage reference.');
			stageRef.current.width(MAX_WIDTH);
			stageRef.current.height(MAX_HEIGHT);
			stageRef.current.scale({ x: 1, y: 1 });
			saveData = stageRef.current.toDataURL();
		} else {
			saveData = data;
		}

		setIsDone(prevDone => true);

		// Fire the callback to the server to flag them as done
		onDone({
			[playerName]: [{
				name: playerName,
				value: saveData
			}]
		});
	}

	/**
	 * Handles Quit Event
	 */
	const handleQuit = () => {
		// console.log('Standard Quit.');
		setIsDone(prevDone => false);
		onQuit();
	}

	/**
	 * Return the component
	 */
	return (
		endGame !== true ?
			<>
			<Grid
				container
				justifyContent="flex-start"
				alignItems="center"
				direction="column"
			>
			{screenIndex === 0 &&
				<Screen0
					isDone={isDone}
					settings={settings}
					playerName={playerName}
					lobbyData={lobbyData}
					onDone={handleDone}
					onQuit={handleQuit}
				/>
			}
			{screenIndex === 1 &&
				<Screen1
					isDone={isDone}
					MAX_WIDTH={MAX_WIDTH}
					MAX_HEIGHT={MAX_HEIGHT}
					stageRef={stageRef}
					gameScreen={gameScreen}
					lobbyData={lobbyData}
					players={players}
					playerIndex={playerIndex}
					playerCount={playerCount}
					settings={settings}
					onDone={handleDone}
					onQuit={handleQuit}
				/>
			}
			{screenIndex === 2 &&
				<Screen2
					isDone={isDone}
					settings={settings}
					gameScreen={gameScreen}
					lobbyData={lobbyData}
					players={players}
					playerCount={playerCount}
					playerIndex={playerIndex}
					onDone={handleDone}
					onQuit={handleQuit}
				/>
			}
			</Grid>
			</>
		:
			<Grid
				container
				direction="column"
			>
				<GameButton color="error" onClick={handleQuit}>Quit</GameButton>
				<Grid
					container
					direction="row"
				>
					<StdEndGame players={players} lobbyData={lobbyData} />
				</Grid>
			</Grid>
	)
}
// Standard.whyDidYouRender = {
// 	logOnDifferentValues: true,
// 	customName: 'Standard'
// };

export default Standard;

export const title = 'Standard';
export const description = 'Players take turns writing, drawing, guessing';
export const settings = [
	{
		name: 'maxPlayers',
		displayName: 'Max Players',
		default: 15,
		component: (newProps) => {
			let props = {
				initialValue: 15,
				minValue: 1,
				maxValue: 15,
				required: true
			}
			props = {...props, ...newProps};
			return <GameNumericInput {...props} />
		}

	},
	{
		name: 'groupSize',
		displayName: 'Group Size',
		default: 1,
		component: (newProps) => {
			let props = {
				initialValue: 1,
				minValue: 1,
				maxValue: 7,
				required: true
			}
			props = {...props, ...newProps};
			return <GameNumericInput {...props} />
		}
	},
	{
		name: 'timer',
		displayName: 'Timer',
		default: 0,
		component: (newProps) => {
			let props = {
				initialValue: 0,
				minValue: 0,
				required: true
			}
			props = {...props, ...newProps};
			return <GameNumericInput {...props} />
		}
	}
];
