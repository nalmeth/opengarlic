import React, { useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Stack, Paper, Typography,
	Button, useMediaQuery, Fab, Box
} from "@mui/material";

import GameButton from "./widgets/GameButton.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import Games from '../modules/Games';
import PlayerStatus from '../modules/PlayerStatus';
import PlayerList from "./widgets/PlayerList.js";
import SettingsDialog from "./SettingsDialog.js";


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

	const initSettings = (mode = Games[0]) => {
		let initSettings = {}
		mode.settings.forEach(setting => {
			initSettings[setting.name] = setting.default;
		});
		return initSettings;
	}

	const [selectedModeSettings, setSelectedModeSettings] = useState(() => initSettings());

	// Dialog states
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogSettingsTitle, setDialogSettingsTitle] = useState(Games[0].title);
	const [dialogSettings, setDialogSettings] = useState(Games[0].settings);

	// Players to show
	const displayPlayers = players.filter(player => player.status !== PlayerStatus.DISCONNECTED);

	// Media queries to adjust styles based on size
	const isXS = useMediaQuery(theme => theme.breakpoints.only('xs'));
	const isSM = useMediaQuery(theme => theme.breakpoints.only('sm'));
	const isSmall = isXS || isSM;

	let fabRight = 0;
	if(isXS) fabRight = 15;
	if(isSM) fabRight = 5;

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
									setSelectedModeSettings(prevSettings => initSettings(mode));
									setDialogSettingsTitle(prevTitle => mode.title);
									setDialogSettings(prevSettings => mode.settings);
								}}
							>
								<Typography variant={isSmall ? 'body2' : 'body1'}>{mode.title}</Typography>
								{owner === playerName &&
								<Box
									justifyContent="flex-end"
									sx={{
										minHeight: 80,
										minWidth: 125,
										position: 'relative'
									}}
								>
									<Fab
										size="small"
										sx={{
											'&.MuiButtonBase-root:hover': {
												bgcolor: '#90caf9'
											},
											position: 'absolute',
											bottom: 0,
											right: fabRight
										}}
										onClick={() => {
											// console.log(`${selectedMode} ${mode.title}`)
											if(selectedMode === mode.title) {
												let updatedDiaglogSettings = [];
												for(let setting of mode.settings) {
													if(selectedModeSettings.hasOwnProperty(setting.name))
														setting.default = selectedModeSettings[setting.name];
													updatedDiaglogSettings.push(setting);
												}
												setDialogSettings(prevSettings => updatedDiaglogSettings);

												// console.dir(updatedDiaglogSettings);
											}
											setDialogOpen(true);
										}}
									>
										<FontAwesomeIcon icon={faGear} />
									</Fab>

								</Box>
								}
							</Grid>
						)
					})}
					<SettingsDialog
						dialogOpen={dialogOpen}
						setDialogOpen={setDialogOpen}
						dialogSettingsTitle={dialogSettingsTitle}
						dialogSettings={dialogSettings}
						onSave={settings => setSelectedModeSettings(prevSettings => settings)}
					/>
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
						<Typography>{Games.map(mode => {
							if(mode.title === selectedMode) return mode.description;
							return '';
						})}</Typography>
					{
					/**
					 * Game Settings
					 */
					Object.keys(selectedModeSettings).map((key) => (
						<Typography key={key} variant="caption">{`${key}: `}
						{selectedModeSettings[key]}
						</Typography>
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