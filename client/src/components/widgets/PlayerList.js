import React from "react"
import {
	Avatar, Divider, IconButton, List,
	ListItem, ListItemAvatar, ListItemButton,
	ListItemText, Tooltip, useMediaQuery
} from "@mui/material"
import Grid from "@mui/material/Unstable_Grid2/Grid2.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCrown as CrownIcon,
	faXmark as XMarkIcon
} from "@fortawesome/free-solid-svg-icons";
import ImageIcon from '@mui/icons-material/Image';

const PlayerList = ({
		icons = true,
		buttonList = false,
		code,
		owner,
		playerName,
		players,
		breakpoints = {xs:4},
		onPlayerKick = ()=>{},
		onPlayerClick = ()=>{}
	}) => {
	const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
	const ListItemComponent = buttonList ?
		ListItemButton : ListItem;

	return (
		<>
		<Grid
			xs={breakpoints.xs}
			sm={breakpoints.sm}
			md={breakpoints.md}
			sx={{
				border: '1px solid #353535',
				borderRadius: '10px 0 0 10px',
				minHeight: 600,
				maxHeight: 600,
				overflowX: 'hidden',
				overflowY: 'auto'
			}}
		>
			<List sx={{
					width: '100%',
					bgcolor: 'background.paper',
					pt: 0
				}}
			>
			{players.map((player, i) => {
				/**
				 * Player list
				 */
				return (
					<React.Fragment key={`player.${i}`}>
						<ListItemComponent
							alignItems="flex-start"
							sx={{ backgroundColor: '#212121' }}
							onClick={() => onPlayerClick(i)}
						>
							<ListItemAvatar>
								<Avatar>
									<ImageIcon />
								</Avatar>
							</ListItemAvatar>

							<ListItemText
								primary={player.name}
								primaryTypographyProps={{
									variant: isSmall ? 'body2' : 'body1'
								}}
								secondary={player.owner ? 'Lobby Owner':`player ${i+1}`}
								secondaryTypographyProps={{
									variant: isSmall ? 'caption' : 'body2'
							}}
							/>

							{icons &&
								player.owner &&
								<Tooltip title="Lobby Owner">
									<IconButton
										edge="end"
										aria-label="owner"
										sx={{
											color: '#a7ad37',
											"&.MuiButtonBase-root:hover": {
												bgcolor: "transparent"
											}
										}}
									>
										<FontAwesomeIcon icon={CrownIcon} />
									</IconButton>
								</Tooltip>
							}
							{icons &&
								(!player.owner && owner === playerName) &&
								<Tooltip title="Kick Player">
									<IconButton
										edge="end"
										aria-label="kick player"
										sx={{
											color: '#ad3739',
											"&.MuiButtonBase-root:hover": {
												bgcolor: "transparent"
											}
										}}
										onClick={() => onPlayerKick(code, player.name)}
									>
										<FontAwesomeIcon icon={XMarkIcon} />
									</IconButton>
								</Tooltip>
							}
						</ListItemComponent>
						<Divider component="li" />
					</React.Fragment>
				)
			})}
			</List>
		</Grid>
		</>
	)

}

export default PlayerList;