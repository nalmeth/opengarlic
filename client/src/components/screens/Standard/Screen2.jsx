import React, { useEffect } from 'react';
import Grid from "@mui/material/Grid"
import GameInput from "../../widgets/GameInput.jsx"
import GameButton from "../../widgets/GameButton.jsx"
import GameTimer from "../../widgets/GameTimer.jsx"
import { removeStorageValue, useLocalStorage } from "../../../modules/Storage.js"

const Screen2 = ({
		isDone,
		settings,
		gameScreen,
		lobbyData,
		players,
		playerCount,
		playerIndex,
		onDone,
		onQuit
	}) => {

	/**
	 * Text data state
	 */
	const [playerData, setPlayerData] = useLocalStorage('playerData', '');
	/**
	 * Timer state
	 */
	const [remaining, setRemaining] = useLocalStorage('remaining',()=>settings.timer);

	/**
	 * Cleanup when this screen unmounts
	 */
	useEffect(() => {
		return () => {
			removeStorageValue('playerData');
			setRemaining(prevRem => settings.timer);
		}
		// eslint-disable-next-line
	},[]);

	/**
	 * Calculate next player position and name
	 */
	const nxtIndex = (playerIndex + gameScreen) % playerCount;
	const nxtPlayerName = players[nxtIndex].name;

	// Lobby Data for the next player
	const nxtData = lobbyData[nxtPlayerName] || null;

	// The data for the next player (on the previous screen)
	const imgData = nxtData[gameScreen - 1]?.value;

	/**
	 * Handle Done Event
	 */
	const handleDone = () => {
		// console.log('Done pressed');
		setRemaining(prevRem => settings.timer);
		onDone(nxtPlayerName, playerData);
	}

	/**
	 * Handle Quit Event
	 */
	const handleQuit = () => {
		// console.log('Screen2 quit');
		setRemaining(prevRem => settings.timer);
		onQuit();
	}

	return (
		<>
		<Grid
			size={12}
			sx={{ mb: 3, gap: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
		>
			<GameInput
				key="whatisthis"
				autoFocus={true}
				required={true}
				disabled={isDone}
				label="What is this drawing"
				onUpdate={data => setPlayerData(data)}
				value={playerData}
				slotProps={{ htmlInput: { maxLength: 60, tabIndex: 0 } }}
			/>
			<GameButton
				disabled={isDone}
				onClick={handleDone}
			>
				Done
			</GameButton>
			<GameTimer
				timerKey="timer3"
				duration={settings.timer}
				initialRemainingTime={remaining}
				onUpdate={remain => setRemaining(prevRem => remain)}
				onComplete={handleDone}
				isPlaying={!isDone}
			/>
			<GameButton color="error" onClick={handleQuit}>Leave</GameButton>
		</Grid>

		<Grid>
			<img src={imgData || 'images/blank.png'} alt="prompt drawing"/> :
		</Grid>
		</>
	)
}

export default Screen2;