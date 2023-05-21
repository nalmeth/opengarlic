import React, { useEffect } from 'react';
import Grid from "@mui/material/Unstable_Grid2/Grid2.js";
import GameInput from "../../widgets/GameInput.js";
import GameButton from "../../widgets/GameButton.js";
import GameTimer from "../../widgets/GameTimer.js";
import { removeStorageValue, useLocalStorage } from "../../../modules/Storage.js";

const Screen0 = ({
		isDone,
		settings,
		playerName,
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
	const [remaining, setRemaining] = useLocalStorage('remaining', ()=>settings.timer);

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
	 * Handles Done Event
	 */
	const handleDone = () => {
		// console.log('Done pressed');
		setRemaining(prevRem => settings.timer);
		onDone(playerName, playerData);
	}

	/**
	 * Handles Quit Event
	 */
	const handleQuit = () => {
		// console.log('Screen0 quit');
		setRemaining(prevRem => settings.timer);
		onQuit();
	}

	return (
		<>
		<Grid
			xs={12} mb={3} gap={4}
			display="flex"
			justifyContent="center"
			alignItems="center"
		>
			<GameInput
				key="startingprompt"
				required={true}
				autoFocus={true}
				label="Enter a word or phrase"
				disabled={isDone}
				onUpdate={(data) => setPlayerData(data)}
				value={playerData}
			/>
			<GameButton disabled={isDone} onClick={handleDone}>Done</GameButton>
			<GameTimer
				timerKey="timer1"
				duration={settings.timer}
				initialRemainingTime={remaining}
				onUpdate={remain => setRemaining(prevRem => remain)}
				onComplete={handleDone}
				isPlaying={!isDone}
			/>
			<GameButton color="error" onClick={handleQuit}>Leave</GameButton>
		</Grid>
		</>
	)
}

export default Screen0;