'use client';

import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Pusher from 'pusher-js';

export default function Dashboard() {
    useEffect(() => {
        // Initialize Pusher client (Soketi uses same protocol)
        const pusher = new Pusher('local', {
            wsHost: 'localhost',
            wsPort: 6001,
            forceTLS: false,
            cluster: 'mt1',
            enabledTransports: ['ws'], // enable WebSocket
        });

        // Subscribe to channel
        const channel = pusher.subscribe('test-channel');

        // Listen for event
        channel.bind('test-event', (data: any) => {
            console.log('Received event:', data);
            alert(`Message: ${data.message}`);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

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
                <p>Listening for WebSocket events...</p>
            </Box>
        </Box>
    );
}