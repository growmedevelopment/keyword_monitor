import toast, { type Toast } from 'react-hot-toast';
import { Box, Button, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import React from "react";

interface Props {
    toastInstance: Toast;
    message: string | React.ReactNode;
}

export default function ErrorToast({ toastInstance, message }: Props) {
    return (
        <Paper
            elevation={6}
            sx={{
                maxWidth: 500,
                width: '100%',
                display: 'flex',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'error.light',
                opacity: toastInstance.visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
                maxHeight: '50dvh',

            }}
        >
            <Box sx={{ flex: 1, p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start',  overflowY: 'scroll' }}>
                <ErrorOutlineIcon color="error" sx={{ mt: 0.3, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
                    {message}
                </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', display: 'flex' }}>
                <Button
                    onClick={() => toast.dismiss(toastInstance.id)}
                    sx={{
                        borderRadius: 0,
                        px: 2,
                        color: 'error.main',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        minWidth: 70,
                    }}
                >
                    Close
                </Button>
            </Box>
        </Paper>
    );
}
