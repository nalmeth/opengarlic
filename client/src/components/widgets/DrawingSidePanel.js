import Grid from '@mui/material/Unstable_Grid2';
import { Divider, useMediaQuery } from "@mui/material";
import { Stack } from "@mui/system";
import DrawToolPanel from '../widgets/DrawingTools.js'
import ColorPalette from "./ColorPalette.js";
import { round2 } from "../../modules/Helpers.js";


const DrawingSidePanel = ({
		toolSettings,
		setTool,
		resetTools
	}) => {

	const isSmall = useMediaQuery(theme => theme.breakpoints.down('xl'));

	return (
		<Grid
			key="toolPanel"
			// xs={12} sm={12} md={10} lg={8} xl={2}
			sx={{
				maxWidth: isSmall ? 800 : 300
			}}
		>
			<Stack spacing={2} direction={isSmall ? 'row':'column'}>

				<DrawToolPanel
					activeTool={toolSettings.tool.name}
					setTool={setTool}
					resetTools={resetTools}
				/>

				{!isSmall && <Divider light />}

				<ColorPalette setColor={color => {
					if(color.length > 7) {
						// Convert alpha hex to int.
						// Then convert to 0-1 decimal range
						// Then round to two decimal places
						const newOp = round2(parseInt(color.substring(7), 16)/255);

						setTool('brushColor', color.substring(0,7));
						setTool('opacity', newOp);
						return;
					}

					setTool('brushColor', color);
					setTool('opacity', 1);
				}} />

			</Stack>
		</Grid>
	)
}

export default DrawingSidePanel;