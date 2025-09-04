import type {ReactNode} from "react";
import {Box, useTheme, alpha} from '@mui/material';
export default  function IconBadge({color, children}: { color: string; children: ReactNode}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                fontSize: 28,
                width: 52,
                height: 52,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                color:
                    theme.palette.getContrastText(color) ??
                    (theme.palette.mode === 'light' ? '#fff' : theme.palette.grey[900]),
                background: `linear-gradient(135deg, ${alpha(color, 0.95)} 0%, ${alpha(
                    color,
                    0.6
                )} 100%)`,
                boxShadow: `0 6px 16px ${alpha(color, 0.35)}`,
            }}
            aria-hidden
        >
            {children}
        </Box>
    );
}