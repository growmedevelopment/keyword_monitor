import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';

interface Props {
    onClose: () => void;
    onSubmit: (urls: string[]) => void;
    dialogTitle: string;
}

export default function AddUrlDialog({ onClose, onSubmit, dialogTitle }: Props) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        const urls = input
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        if (urls.length > 0) {
            onSubmit(urls);
            setInput('');
            onClose();
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>

            <DialogContent>
                <Typography variant="body2" mb={1}>
                    Enter or paste URLs below. Each line will be added as a URL.
                </Typography>

                <TextField
                    placeholder="https://example.com/page-1
https://example.com/page-2"
                    multiline
                    minRows={8}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" disabled={input.trim() === ''} onClick={handleSubmit}>
                    Add URLs
                </Button>
            </DialogActions>
        </Dialog>
    );
}