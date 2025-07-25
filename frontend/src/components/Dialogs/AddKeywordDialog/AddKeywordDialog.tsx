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
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (keywords: string[]) => void;
}

export default function AddKeywordDialog({ isOpen, onClose, onSubmit }: Props) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        const keywords = input
            .split('\n')
            .map(k => k.trim())
            .filter(k => k.length > 0);
        if (keywords.length > 0) {
            onSubmit(keywords);
            setInput('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Keywords</DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={1}>
                    Enter or paste keywords below. Each line will be added as a keyword.
                </Typography>
                <TextField
                    placeholder="Enter keywords here..."
                    multiline
                    minRows={10}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Add</Button>
            </DialogActions>
        </Dialog>
    );
}