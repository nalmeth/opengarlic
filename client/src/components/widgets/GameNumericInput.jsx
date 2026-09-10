import { isNumber } from "../../modules/Helpers.js";
import { useState } from "react";
import { TextField } from "@mui/material";

const GameNumericInput = (props) => {

	const initialValue = isNumber(props.initialValue) ? props.initialValue : props.maxValue;

	const [value, setValue] = useState(initialValue);

	const newProps = {
		...props,

		size: props.size || 'small',
		initialValue: initialValue,

		// Increment/Decrement on up/down arrow keys
		onKeyUp: (event) => {
			let newValue = Number(event.target.value);
			let update = false;
			switch(event.which) {
				case 38:
					if(!isNumber(props.maxValue) || (newValue + 1 <= props.maxValue)) {
						newValue += 1;
						update = true;
					}
					break;
				case 40:
					if(!isNumber(props.minValue) || (newValue - 1 >= props.minValue)) {
						newValue -= 1;
						update = true;
					}
					break;
				case 46:
				case 8:
					if(newValue < props.maxValue ||	newValue > props.minValue) update = true;
					break;
				default:
			}
			if(update) {
				setValue(prevVal => newValue);
				if(typeof props.onUpdate === 'function')
					props.onUpdate(newValue);
			}
			event.preventDefault();
		},

		// Validate number falls between min/max
		onChange: (event) => {
			let newValue = event.target.value;
			if(!isNumber(newValue) ||
				newValue > props.maxValue || newValue < props.minValue)
			 		return;

			setValue(preVal => newValue);
			if(typeof props.onUpdate === 'function')
				props.onUpdate(newValue);
			event.preventDefault();
		}
	}

	delete newProps.initialValue;
	delete newProps.onUpdate;
	delete newProps.minValue;
	delete newProps.maxValue;

	return (
		<TextField
			value={value}
			{...newProps}
		/>
	)
}

export default GameNumericInput;