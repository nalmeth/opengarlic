import React, { useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Stack, Paper,
	Typography, Button, useMediaQuery, //Fab, Box
} from "@mui/material";
import GameButton from "./widgets/GameButton.js";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGear } from "@fortawesome/free-solid-svg-icons";

import Games from '../modules/Games';
import PlayerStatus from '../modules/PlayerStatus';
import PlayerList from "./widgets/PlayerList.js";


/**
 * Lobby Component
 * @prop {number} code
 * @prop {boolean} owner
 * @prop {Array} players
 * @prop {string} playerName
 * @prop {function} onModeSelect
 * @prop {function} onPlayerKick
 * @returns {JSX.Element}
 */
const Lobby = ({
		code,
		owner,
		players,
		playerName,
		onModeSelect,
		onPlayerKick,
	}) => {

	// Set default mode into state
	const [selectedMode, setSelectedMode] = useState(Games[0].title);
	const [selectedModeSettings, setSelectedModeSettings] = useState(Games[0].settings);

	const displayPlayers = players.filter(player => player.status !== PlayerStatus.DISCONNECTED);
	const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));

	return (
		<>
		<PlayerList
			code={code}
			owner={owner}
			players={displayPlayers}
			playerName={playerName}
			onPlayerKick={onPlayerKick}
			breakpoints={{xs:8,sm:6,md:5}}
		/>
		<Grid
			xs={4} sm={6} md={7}
			sx={{
				border: '1px solid #353535',
				borderRadius: '0px 0px 10px 0px',
				minHeight: 600,
				maxHeight: 600,
				overflow: "hidden"
			}}
		>
			<Stack
				direction="column"
				justifyContent="center"
				alignItems="center"
			>
				<Paper sx={{ height: 300, overflowX: 'hidden' }}>
					<Grid
						container
						columns={{ xs: 1, sm: 4, md: 3, lg: 4, xl: 4}}

					>
					{Games.map(mode => {
						return (
							<Grid
								key={mode.title} xs={1} sm={2} md={1} lg={2}
								sx={{
									border: `1px solid ${(mode.title===selectedMode?'#fcea01':'#353535')}`,
									minHeight: 125,
									minWidth: 125,
									p: 1,
									cursor: 'pointer'
								}}
								onClick={() => {
									if(owner !== playerName) return;
									setSelectedMode(prevMode => mode.title);
									setSelectedModeSettings(prevSettings => mode.settings);
								}}
							>
								<Typography variant={isSmall ? 'body2' : 'body1'}>{mode.title}</Typography>
								{/* {owner === playerName &&
								<Box justifyContent="flex-end">
									<Fab size="small" sx={{
										'&.MuiButtonBase-root:hover': {
											bgcolor: '#90caf9'
										}
									}}>
										<FontAwesomeIcon icon={faGear} />
									</Fab>
								</Box>
								} */}
							</Grid>
						)
					})}

					{// Filler placeholders for game modes
					Array(15).fill(1).map((_,i) => {
						return (
							<Grid
								key={i} xs={1} sm={2} md={1} lg={2}
								sx={{
									border: `1px solid ${(i===selectedMode?'#fcea01':'#353535')}`,
									minHeight: 125,
									minWidth: 125,
									p: 1,
									cursor: 'pointer'
								}}
								onClick={() => console.log('Mode in development')}
							>
								<Typography variant={isSmall ? 'body2' : 'body1'}>New Mode Here</Typography>
							</Grid>
						)
					})}

					</Grid>
				</Paper>
				<Paper
					sx={{
						width: '100%',
						height: 300,
						p: 1,
						borderTop: '1px solid #353535',
						borderRadius: '0px',
						overflow: 'hidden',
					}}
				>
					<Stack sx={{
							justifyContent: 'space-between',
							height: '100%'
						}}
					>
					{
					/**
					 * Game Settings
					 */
					Object.keys(selectedModeSettings).map((key) => (
						<Typography key={key} variant="caption">{`${key}: `}{selectedModeSettings[key]}</Typography>
					))}

					{
					/**
					 * Start button or waiting message
					 */
						owner === playerName ?
						<GameButton
							size={isSmall ? 'small' : 'medium'}
							sx={{ width: '100%' }}
							onClick={() => onModeSelect(selectedMode, selectedModeSettings)}
						>
							Start Game
						</GameButton>
					:
						<Button sx={{ width: '100%' }}>Waiting...</Button>
					}

					</Stack>
				</Paper>
			</Stack>
		</Grid>
		</>
	)
}

export default Lobby;