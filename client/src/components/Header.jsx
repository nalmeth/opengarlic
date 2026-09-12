import Grid from '@mui/material/Grid';
import {Typography, useMediaQuery } from "@mui/material";

const Header = (props) => {
	const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
	const logoVariant = isSmall ? 'h6' : 'h4';
	const codeVariant = isSmall ? 'body1' : 'h4';
	// console.log('small', isSmall, 'variant', headerVariant)
	return (
		<Grid
			container
			spacing={2}
			sx={{ pt: 1, pb: 1, justifyContent: 'center', alignItems: 'center' }}
		>
			<Grid size={{ xs: 3, sm: 4, md: 4, lg: 4, xl: 4 }}>
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
			<Grid size={{ xs: 6, sm: 5, md: 4, lg: 4, xl: 3 }}>
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