'use client';
import { Box, Typography } from '@mui/material';


export default function Dashboard() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
            >
                <p>Something could be here</p>
            </Box>
        </Box>
    );
}