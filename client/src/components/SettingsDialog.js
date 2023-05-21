import React, { useEffect, useRef } from "react";
import {
	Dialog, DialogActions, DialogContent,
	DialogContentText, DialogTitle,
	Stack,
	useMediaQuery
} from "@mui/material";
import GameButton from "./widgets/GameButton.js";
import Grid from "@mui/material/Unstable_Grid2/Grid2.js";
import { isNumber } from "../modules/Helpers.js";

const SettingsDialog = ({
		dialogOpen,
		setDialogOpen,
		dialogSettingsTitle,
		dialogSettings,
		onSave
	}) => {

	const fullscreen = useMediaQuery(theme => theme.breakpoints.only('xs'));

	// Store settings to return when saving
	const updatedSettings = useRef({});

	// Initialize save settings
	useEffect(() => {
		dialogSettings.forEach(setting => {
			updatedSettings.current[setting.name] = setting.default;
		});
	},[dialogSettings]);

	const minWidth = !fullscreen ? 600 : 0;

	// Return settings to save, close dialog
	const handleSave = () => {
		onSave(updatedSettings.current)
		setDialogOpen(false);
	}

	return (
		<Dialog
			fullScreen={fullscreen}
			fullWidth={!fullscreen}
			open={dialogOpen}
			scroll="paper"
			onClose={()=>setDialogOpen(false)}
			sx={{ minWidth }}
			aria-labelledby="settings-dialog-title"
			aria-describedby="settings-dialog-description"
		>
			<DialogTitle id="settings-dialog-title">
				{dialogSettingsTitle}
			</DialogTitle>
			<DialogContent>
				<Stack spacing={1}>
				{dialogSettings.map((setting, idx) => {
					return (
						<Grid container columns={2} key={idx}>
							<Grid xs={1}>
								<DialogContentText>{setting.displayName}:</DialogContentText>
							</Grid>
							<Grid xs={1}>
								{setting.component({
									initialValue: setting.default,
									onUpdate: (value) => {
										value = isNumber(value) ? Number(value) : value;
										updatedSettings.current[setting.name] = value
									}
								})}
							</Grid>
						</Grid>
					)
				})}
				</Stack>
			</DialogContent>
			<DialogActions>
				<GameButton
					onClick={()=>setDialogOpen(false)}
					size="medium"
					autoFocus
				>
					Cancel
				</GameButton>
				<GameButton
					onClick={handleSave}
					size="medium"
					autoFocus
				>
					Save
				</GameButton>
			</DialogActions>
		</Dialog>
	)
}

export default SettingsDialog;