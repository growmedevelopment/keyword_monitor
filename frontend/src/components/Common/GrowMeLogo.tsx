import { Box } from '@mui/material';
import growMeLogoSVG from '../../assets/growme_logo.svg';

export default function GrowMeLogo({ size = 48 }: { size?: number }) {
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                component="img"
                src={growMeLogoSVG}
                alt="GrowMe Logo"
                sx={{
                    width: size,
                    height: size,
                    display: 'inline-block',
                }}
            />
        </Box>
    );
}