import React, { useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import { Divider, Stack, TextField } from "@mui/material";
import GameButton from "./widgets/GameButton.js";
import GameInput from "./widgets/GameInput.js";

/**
 * Create/Join Lobby Component(Page)
 * @prop {string} playerName
 * @prop {string} lobbyCode
 * @prop {function} onNameChange
 * @prop {function} onCodeChange
 * @prop {function} onCreateClick
 * @prop {function} onJoinClick
 * @returns {JSX.Element}
 */
const Login = ({
		playerName,
		lobbyCode,
		onNameChange,
		onCodeChange,
		onCreateClick,
		onJoinClick
	}) => {

	const isValidPlayerName = (name) => name.length >= 3;
	const isValidCode = (code) => code.length === 6;
	const isCode = (code) => code.length > 0;

	// Flag if create button should be disabled
	const [createDisabled, setCreateDisabled] = useState(
		() => !isValidPlayerName(playerName) || isCode(lobbyCode)
	);
	// Flag if join button should be disabled
	const [joinDisabled, setJoinDisabled] = useState(
		() => !isValidPlayerName(playerName) || !isValidCode(lobbyCode)
	);

	// Flag if player name was invalid on blur
	const [nameError, setNameError] = useState(false);
	// Flag if lobby code was invalid on blur
	const [codeError, setCodeError] = useState(false);

	return (
		<React.Fragment>

			<Grid xs={6} md={4}>

				<Stack spacing={2}>
					<GameInput
						label="Player Name"
						size="medium"
						autoFocus={true}
						value={playerName}
						error={nameError}
						helperText={nameError && "Name must be at least 3 characters"}
						inputProps={{ maxLength: 20, tabIndex: 0 }}
						onUpdate={value => {
							const playerName = value.trim();

							setCreateDisabled(
								!isValidPlayerName(playerName) || isCode(lobbyCode)
							);
							setJoinDisabled(
								!isValidPlayerName(playerName) || !isValidCode(lobbyCode)
							);

							// Continue to show error (if we have one) until name is valid
							setNameError(nameError && !isValidPlayerName(playerName));

							// Trigger callback to update state in parent
							onNameChange(playerName);
						}}
						onBlur={event => {
							const playerName = event.target.value.trim();

							setNameError(playerName.length > 0 && !isValidPlayerName(playerName));
						}}
					/>

					<Divider light>THEN</Divider>

					<GameButton
						disabled={createDisabled}
						onClick={onCreateClick}
						tabIndex={0}
					>
						Create Lobby
					</GameButton>

					<Divider light>OR</Divider>

					<GameInput
						label="Lobby Code"
						size="medium"
						value={lobbyCode}
						error={codeError}
						helperText={codeError && "Code must be 6 characters"}
						inputProps={{ maxLength: 6, tabIndex: 0 }}
						onUpdate={value => {
							const code = value.trim();

							setJoinDisabled(
								!isValidPlayerName(playerName) || !isValidCode(code)
							);
							setCreateDisabled(
								!isValidPlayerName(playerName) || isCode(code)
							);

							// Continue to show error (if we have one) until code is valid
							setCodeError(codeError && isCode(code) && !isValidCode(code));

							// Trigger callback to update state in parent
							onCodeChange(code);
						}}
						onBlur={event => {
							const code = event.target.value.trim();
							// Flag error for too short code (when not empty)
							setCodeError(isCode(code) && !isValidCode(code));
						}}
					/>
					<GameButton
						disabled={joinDisabled}
						onClick={onJoinClick}
						tabIndex={0}
					>
						Join Lobby
					</GameButton>
				</Stack>

			</Grid>
		</React.Fragment>
	)
}

export default Login;