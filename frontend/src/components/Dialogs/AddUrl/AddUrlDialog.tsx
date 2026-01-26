import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { parseRawInput, validateUrlList, getUniqueUrls } from './URLhelpers';

interface Props {
    onClose: () => void;
    onSubmit: (urls: string[]) => void;
    dialogTitle: string;
}

export default function AddUrlDialog({ onClose, onSubmit, dialogTitle }: Props) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [validUrlsCount, setValidUrlsCount] = useState(0);

    // 1. Debounced Effect: Updates the "Links: X" count and "Error" warnings
    useEffect(() => {
        const timer = setTimeout(() => {
            // Clear previous states
            setError(null);

            const rawUrls = parseRawInput(input);
            if (rawUrls.length === 0) {
                setValidUrlsCount(0);
                return;
            }

            const { valid, invalid } = validateUrlList(rawUrls);

            // Even if there are invalid URLs, we should still
            // calculate the valid ones so the "Links: X" count is accurate.

            if (invalid.length > 0) {
                // Show error but DON'T return yet, so we can count the valid ones below
                setError(`Found ${invalid.length} invalid URL(s): ${invalid.join(', ')}`);
            }

            const uniqueUrls = getUniqueUrls(valid);

            // Update the UI count
            setValidUrlsCount(uniqueUrls.urls.length);

            // If we didn't have invalid URL errors, check for duplicates errors
            // Note: We prioritize showing "Invalid URL" errors over "Duplicate" errors
            if (invalid.length === 0 && uniqueUrls.errors.length > 0) {
                setError(`Found and removed ${uniqueUrls.errors.length} duplicate URL(s).`);
            }

        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    // 2. Submit Handler: Calculates fresh data instantly (No waiting)
    const handleSubmit = () => {
        setError(null);

        // RE-RUN logic synchronously to get the latest data immediately
        const rawUrls = parseRawInput(input);
        const { valid, invalid } = validateUrlList(rawUrls);

        if (invalid.length > 0) {
            // Block submit if there are actual invalid URL formats
            setError(`Cannot submit. Fix ${invalid.length} invalid URL(s): ${invalid[0]}...`);
            return;
        }

        const uniqueUrls = getUniqueUrls(valid);

        if (uniqueUrls.urls.length === 0) return;

        onSubmit(uniqueUrls.urls);

        setInput('');
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        // We do NOT clear error here anymore, to avoid flickering.
        // The useEffect will handle clearing/updating errors after the delay.
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>

            <DialogContent>
                <Typography variant="body2" mb={1}>
                    Enter or paste URLs below. Each line will be added as a URL.
                </Typography>

                {/* Visual Feedback for the user */}
                <Typography variant="caption" sx={{ fontWeight: 'bold', display:'block', mb: 1 }}>
                    Links to add: {validUrlsCount}
                </Typography>

                <TextField
                    placeholder="https://example.com/page-1&#10;https://example.com/page-2"
                    multiline
                    minRows={8}
                    fullWidth
                    value={input}
                    onChange={handleInputChange}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={input.trim() === ''}
                    onClick={handleSubmit}
                >
                    Add URLs
                </Button>
            </DialogActions>
        </Dialog>
    );
}