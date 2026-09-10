import Grid from '@mui/material/Unstable_Grid2';
import {Typography, useMediaQuery } from "@mui/material";

const Header = (props) => {
	const shouldCollapse = useMediaQuery(theme => theme.breakpoints.down('sm'));
	const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
	const logoVariant = isSmall ? 'h6' : 'h4';
	const codeVariant = isSmall ? 'body1' : 'h4';
	// console.log('small', isSmall, 'variant', headerVariant)
	return (
		<Grid
			container
			spacing={2}
			pt={1} pb={1}
			direction={shouldCollapse ? 'column':'row'}
			justifyContent="center"
			alignItems="center"
		>
			<Grid xs={3} sm={4} md={4} lg={4} xl={4}>
				<Typography variant={logoVariant}>
					OpenGarlic
				</Typography>
				{props.gameLobby?.code && isSmall &&
				<Typography variant={codeVariant}>
					{`Lobby: ${props.gameLobby.code}`}
				</Typography>
				}
			</Grid>
			{props.gameLobby?.code &&
			<>
			{!isSmall &&
			<Grid xs={6} sm={5} md={4} lg={4} xl={3}>
				<Typography variant={codeVariant}>
					{`Lobby: ${props.gameLobby.code}`}
				</Typography>
			</Grid>
			}
			</>
			}
		</Grid>
	)
}

export default Header;