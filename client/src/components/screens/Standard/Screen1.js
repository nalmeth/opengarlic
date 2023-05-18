import Grid from "@mui/material/Unstable_Grid2/Grid2.js";
import GameButton from "../../widgets/GameButton.js";
import GameInput from "../../widgets/GameInput.js";
import GameTimer from "../../widgets/GameTimer.js";
import DrawingArea from "../../widgets/DrawingArea.js";
import { useLocalStorage } from "../../../modules/Storage.js";

const Screen1 = ({
		isDone,
		MAX_WIDTH,
		MAX_HEIGHT,
		stageRef,
		gameScreen,
		lobbyData,
		players,
		playerIndex,
		playerCount,
		settings,
		onDone,
		onQuit
	}) => {

	/**
	 * Timer state
	 */
	const [remaining, setRemaining] = useLocalStorage('remaining',()=>settings.time);

	/**
	 * Calculate next player position and name
	 */
	const nxtIndex = (playerIndex + gameScreen) % playerCount;
	const nxtPlayerName = players[nxtIndex].name;

	// Lobby Data for the next player
	const nxtData = lobbyData[nxtPlayerName] || null;

	// The data for the next player (on the previous screen)
	const displayText = nxtData[gameScreen - 1]?.value;

	// If we're done, we display the image data
	// This should happen only if page is refreshed
	const imgData = nxtData[gameScreen]?.value;
	// console.log(`done ${isDone} nxtData ${JSON.stringify(nxtData)} -- ${imgData}`)

	/**
	 * Handle Done Event
	 */
	const handleDone = () => {
		setRemaining(prevRem => settings.time);
		onDone(nxtPlayerName);
	}

	/**
	 * Handle Quit Event
	 */
	const handleQuit = () => {
		// console.log('Clear remaining');
		setRemaining(prevRem => settings.time);
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
				key="drawthis"
				disabled
				required={false}
				label="Draw this"
				defaultValue={displayText}
			/>
			<GameButton
				key="donebtn"
				disabled={isDone}
				onClick={handleDone}
			>
				Done
			</GameButton>
			<GameTimer
				timerKey="timer2"
				duration={settings.time}
				initialTimeRemaining={remaining}
				onUpdate={remain => setRemaining(prevRem => remain)}
				onComplete={handleDone}
				isPlaying={!isDone}
			/>
			<GameButton key="leavebtn" color="error" onClick={handleQuit}>Leave</GameButton>
		</Grid>
		<Grid display="flex">
			{isDone ?
				<img src={imgData || 'images/blank.png'} alt="current drawing"/> :
				<DrawingArea
					key={gameScreen}
					stageRef={stageRef}
					showTools={!isDone}
					lockBoard={isDone}
					MAX_WIDTH={MAX_WIDTH}
					MAX_HEIGHT={MAX_HEIGHT}
				/>
			}
		</Grid>
		</>
	)
}

export default Screen1;