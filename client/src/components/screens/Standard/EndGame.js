import React, { useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Avatar, Divider, List, ListItem, ListItemAvatar, Typography
} from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import Bubble, {
	BUBBLE_LEFT,
	BUBBLE_RIGHT
} from "../../widgets/Bubble.js";
import PlayerList from "../../widgets/PlayerList.js";

/**
 * End Screen for Standard game mode
 * @param {object} props
 * @returns {JSX.Element}
 */
const StdEndGame = ({
		players,
		lobbyData
	}) => {

	const [selectedPlayer, setSelectedPlayer] = useState(0);

	const selectedPlayerName = players[selectedPlayer].name;

	return (
		<>
		<PlayerList
			icons={false}
			players={players}
			buttonList={true}
			onPlayerClick={(i) => setSelectedPlayer(i)}
		/>
		<Grid
			container
			key="dataDisplay"
			xs={8}
			sx={{
				border: '1px solid #353535',
				borderRadius: '0px 0px 10px 0px',
				minHeight: 600,
				maxHeight: 600,
				overflow: "auto"
			}}
		>
			<List sx={{ paddingTop: 0 }}>
			{lobbyData[selectedPlayerName].map((data, i) => {

				const key = i % 2 === 1 ? `img.${i}` : `words.${i}`;
				const listItemProps = {
					justifyContent: i % 2 === 1 ? 'flex-start':'flex-end',
					alignItems: i % 2 === 1 ? 'flex-start':'center',
					paddingRight: i % 2 === 1 ? '16px' : '0px',
				}

				return (
					<React.Fragment key={key}>
						<ListItem sx={listItemProps}>
							{i % 2 === 0 ?

							/**
							 * This section displays the words
							 */
							<>
							<Grid
								container
								overflow="hidden"
								sx={{
									pt: 1, pb: 1,
									pl: 2, pr: 2,
									mr: 2,
									justifyContent: 'flex-end',
									alignItems: 'center'
								}}
							>
								<Bubble side={BUBBLE_RIGHT}>
									<Typography>{data?.value}</Typography>
								</Bubble>
								<ListItemAvatar>
									<Avatar>
										<ImageIcon />
									</Avatar>
								</ListItemAvatar>
								<Typography variant="caption">{data?.name}</Typography>
							</Grid>
							</>

							:

							/**
							 * This section displays drawings
							 */
							<Grid
								container
								overflow="hidden"
								sx={{
									pt: 1, pb: 1,
									pl: 2, pr: 2,
									mr: 2,
									justifyContent: 'flex-start',
									alignItems: 'top'
								}}
								columns={12}
							>
								<Grid xs={1}>
									<Typography variant="caption">{data.name}</Typography>
									<ListItemAvatar>
										<Avatar>
											<ImageIcon />
										</Avatar>
									</ListItemAvatar>
								</Grid>
								<Grid xs={11}>
									<Bubble side={BUBBLE_LEFT}>
										<img src={data.value || 'images/blank.png'} width="100%" alt={key} />
									</Bubble>
								</Grid>
							</Grid>

							}
						</ListItem>
						{i === lobbyData[selectedPlayerName] && <Divider />}
					</React.Fragment>
				)
			})}
			</List>

		</Grid>
		</>
	)
}

export default StdEndGame;