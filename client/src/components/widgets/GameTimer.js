import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
/**
 * duration - Duration of timer,
 * size - size of the timer,
 * colors - array of hex colors
 * colorsTime - array of times when color should go next
 *
 * @param {props} param0
 * @returns
 */
const GameTimer = ({
	timerKey = "gametimer",
	isPlaying = true,
	duration,
	initialRemainingTime = null,
	size = 60,
	colors,
	colorsTime,
	strokeWidth = 5,
	onUpdate,
	onComplete,
	children
}) => {

	const timeColors = Array.isArray(colors) && colors.length >= 2 ?
						colors : ['#02bb12','#ddd711','#d70f0f'];

	const colorTimers = Array.isArray(colorsTime) && colorsTime >= 2 ?
						colorsTime : [
							duration,
							Math.ceil(duration*.40),
							0
						];

	return (
		<CountdownCircleTimer
			key={timerKey}
			isPlaying={isPlaying}
			initialRemainingTime={initialRemainingTime}
			size={size}
			duration={duration}
			colors={timeColors}
			colorsTime={colorTimers}
			strokeWidth={strokeWidth}
			onUpdate={onUpdate}
			onComplete={onComplete}
			children={children}
		>
			{({ remainingTime }) => {
				return duration === 0 ?
					<FontAwesomeIcon icon={faInfinity} /> : remainingTime;
			}}
		</CountdownCircleTimer>
	)
}

export default GameTimer;