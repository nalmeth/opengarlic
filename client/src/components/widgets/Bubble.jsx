/**
 * side -BUBBLE_LEFT or BUBBLE_RIGHT constant,
 * children - child nodes automatically passed in when wrapping another component
 * @param {object} props
 * @returns
 */
const Bubble = ({ side, children }) => {
	if(![BUBBLE_LEFT,BUBBLE_RIGHT].includes(side)) side = BUBBLE_RIGHT;
	const containerClass = side === BUBBLE_RIGHT ? 'bubble-direction-reverse':'';
	const bubbleClass = side === BUBBLE_RIGHT ? 'playerRight':'playerLeft';
	return (
		<div className={`bubble-container ${containerClass}`}>
			<div className={`bubble ${bubbleClass}`}>
			{children}
			</div>
		</div>
	)
}

export default Bubble;

export const BUBBLE_LEFT = 'left';
export const BUBBLE_RIGHT = 'right';