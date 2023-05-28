import React, { useEffect, useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import {
	Avatar, Divider, List, ListItem, ListItemAvatar, Typography
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser as CircleUser } from "@fortawesome/free-solid-svg-icons";
import Bubble, {
	BUBBLE_LEFT,
	BUBBLE_RIGHT
} from "../../widgets/Bubble.js";
import PlayerList from "../../widgets/PlayerList.js";
import GameButton from "../../widgets/GameButton.js";
import { wordWrap } from "../../../modules/Helpers.js";

/**
 * End Screen for Standard game mode
 * @param {object} props
 * @returns {JSX.Element}
 */
const StdEndGame = ({
		players,
		lobbyData,
		createGIF,
		socket
	}) => {

	const [selectedPlayer, setSelectedPlayer] = useState(0);
	const [gifButtonDisabled, setGifButtonDisabled] = useState(false);

	const selectedPlayerName = players[selectedPlayer].name;

	const events = {
		GIFCreated: (data, filename) => {
			setGifButtonDisabled(false);
			let link = document.createElement('a');
			link.href = data;
			link.download = filename;
			link.style = 'display:none';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	useEffect(() => {
		// console.log('Attach Standard Events');
		for(const name in events) {
			socket.on(name, events[name]);
		}

		return () => {
			// console.log('Detach Standard Events');
			for(const name in events) {
				socket.off(name, events[name]);
			}
		}
		// eslint-disable-next-line
	}, []);

	return (
		<>
		<PlayerList
			icons={false}
			players={players}
			buttonList={true}
			selectedIndex={selectedPlayer}
			onPlayerClick={(i) => setSelectedPlayer(i)}
			breakpoints={{xs:4,lg:3}}
		/>
		<Grid
			container
			key="dataDisplay"
			xs={8}
			lg={9}
			sx={{
				border: '1px solid #353535',
				borderRadius: '0px 0px 10px 0px',
				minHeight: 600,
				maxHeight: 600,
				overflow: "auto",
				backgroundColor: '#272727'
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
										<FontAwesomeIcon icon={CircleUser} size="2xl" />
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
									<Typography variant="caption">{wordWrap(data.name, 8)}</Typography>
									<ListItemAvatar>
										<Avatar>
											<FontAwesomeIcon icon={CircleUser} size="2xl" />
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

			<Grid container sx={{ flexGrow: 1 }} mb={3}>
				<Grid xs xsOffset={4} lgOffset={5}>
					<GameButton
						onClick={() => {
							setGifButtonDisabled(true);
							createGIF(selectedPlayerName);
						}}
						disabled={gifButtonDisabled}
					>
						Download GIF
					</GameButton>
				</Grid>
			</Grid>
		</Grid>
		</>
	)
}

export default StdEndGame;