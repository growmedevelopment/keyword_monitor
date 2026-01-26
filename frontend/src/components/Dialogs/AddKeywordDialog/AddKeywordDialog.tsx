import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import tinycolor from 'tinycolor2';

import keywordGroupService from "../../../services/keywordGroupService.ts";
import type { KeywordGroup } from "../../types/keywordTypes.ts";
import {getUniqueKeywords, parseRawKeywords, validateKeywordList} from "../../../pages/project/KeywordHelpers.ts";



interface Props {
    onClose: () => void;
    onSubmit: (keywords: string[], groupId: number | null) => void;
}

export default function AddKeywordDialog({ onClose, onSubmit }: Props) {
    const { id } = useParams<{ id: string }>();

    // Form State
    const [input, setInput] = useState('');
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

    // Validation State
    const [error, setError] = useState<string | null>(null);
    const [validCount, setValidCount] = useState(0);

    // 1. Fetch Groups on Mount
    useEffect(() => {
        const fetchGroups = async () => {
            if (!id) return;
            try {
                const groups = await keywordGroupService.getByProject(parseInt(id, 10));
                setKeywordGroups(groups);
            } catch (err) {
                console.error("Failed to load keyword groups", err);
            }
        };
        fetchGroups();
    }, [id]);

    // 2. Debounced Validation (Runs 500ms after typing stops)
    useEffect(() => {
        const timer = setTimeout(() => {
            setError(null);

            // Note: input is already lowercased via onChange below
            const rawKeywords = parseRawKeywords(input);

            if (rawKeywords.length === 0) {
                setValidCount(0);
                return;
            }

            // Check Format (Length rules)
            const { valid, invalid } = validateKeywordList(rawKeywords);

            if (invalid.length > 0) {
                // Warning about invalid formats
                setError(`Found ${invalid.length} invalid keyword(s) (too short/long): "${invalid[0]}"...`);
            }

            // Check Duplicates within the list
            const unique = getUniqueKeywords(valid);
            setValidCount(unique.keywords.length);

            // Prioritize duplicate warnings if format is okay
            if (invalid.length === 0 && unique.errors.length > 0) {
                setError(`Found and removed ${unique.errors.length} duplicate(s).`);
            }

        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    // 3. Synchronous Submit (Runs immediately on click)
    const handleSubmit = () => {
        setError(null);

        const rawKeywords = parseRawKeywords(input);

        // Final Format Check
        const { valid, invalid } = validateKeywordList(rawKeywords);
        if (invalid.length > 0) {
            setError(`Cannot submit. Fix ${invalid.length} invalid keyword(s).`);
            return;
        }

        // Final Deduplication
        const unique = getUniqueKeywords(valid);

        if (unique.keywords.length > 0) {
            onSubmit(unique.keywords, selectedGroup);
            setInput('');
            onClose();
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Keywords</DialogTitle>

            <DialogContent>
                <Typography variant="body2" mb={1}>
                    Enter or paste keywords below. Each line will be added as a keyword.
                </Typography>

                {/* Live Count Feedback */}
                <Box mb={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: validCount > 0 ? 'success.main' : 'text.secondary' }}>
                        Keywords to add: {validCount}
                    </Typography>
                </Box>

                <TextField
                    placeholder="Enter keywords here..."
                    multiline
                    minRows={10}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value.toLowerCase())}
                    error={!!error}
                    helperText={error}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="keyword-group-label">Keyword Group</InputLabel>
                    <Select
                        labelId="keyword-group-label"
                        value={selectedGroup ?? ''}
                        label="Keyword Group"
                        onChange={(e) => {
                            const val = e.target.value as string | number;
                            setSelectedGroup(val === '' ? null : Number(val));
                        }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                },
                            },
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {keywordGroups.map((group) => {
                            const bgColor = group.color || '#ccc';
                            const textColor = tinycolor(bgColor).isLight() ? '#000' : '#fff';

                            return (
                                <MenuItem key={group.id} value={group.id}>
                                    <Chip
                                        label={group.name}
                                        size="small"
                                        sx={{
                                            backgroundColor: bgColor,
                                            color: textColor,
                                            fontWeight: 500,
                                            borderRadius: 1,
                                            cursor: 'pointer'
                                        }}
                                    />
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={validCount === 0 && !error}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}