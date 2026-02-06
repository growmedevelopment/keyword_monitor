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
    Box,
    Checkbox,
    ListItemText,
    type SelectChangeEvent
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import tinycolor from 'tinycolor2';

import keywordGroupService from "../../../services/keywordGroupService.ts";
import type { KeywordGroup } from "../../types/keywordTypes.ts";
import { getUniqueKeywords, parseRawKeywords, validateKeywordList } from "../../../pages/project/KeywordHelpers.ts";

interface Props {
    onClose: () => void;
    // Updated to accept an array of group IDs
    onSubmit: (keywords: string[], groupIds: number[]) => void;
}

export default function AddKeywordDialog({ onClose, onSubmit }: Props) {
    const { id } = useParams<{ id: string }>();

    // Form State
    const [input, setInput] = useState('');
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);

    // Changed from number | null to number[] for multi-select
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

    // Validation State
    const [error, setError] = useState<string | null>(null);
    const [validCount, setValidCount] = useState(0);

    // Fetch Groups on Mount
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

    // Validation Effect (Remains the same)
    useEffect(() => {
        const timer = setTimeout(() => {
            setError(null);
            const rawKeywords = parseRawKeywords(input);

            if (rawKeywords.length === 0) {
                setValidCount(0);
                return;
            }

            const { valid, invalid } = validateKeywordList(rawKeywords);

            if (invalid.length > 0) {
                setError(`Found ${invalid.length} invalid keyword(s): "${invalid[0]}"...`);
            }

            const unique = getUniqueKeywords(valid);
            setValidCount(unique.keywords.length);

            if (invalid.length === 0 && unique.errors.length > 0) {
                setError(`Found and removed ${unique.errors.length} duplicate(s).`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    const handleGroupChange = (event: SelectChangeEvent<number[]>) => {
        const { target: { value } } = event;
        // Material UI handles the array conversion automatically for multiple select
        setSelectedGroups(typeof value === 'string' ? value.split(',').map(Number) : value);
    };

    const handleSubmit = () => {
        setError(null);
        const rawKeywords = parseRawKeywords(input);
        const { valid, invalid } = validateKeywordList(rawKeywords);

        if (invalid.length > 0) {
            setError(`Cannot submit. Fix ${invalid.length} invalid keyword(s).`);
            return;
        }

        const unique = getUniqueKeywords(valid);

        if (unique.keywords.length > 0) {
            onSubmit(unique.keywords, selectedGroups);
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

                <Box mb={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: validCount > 0 ? 'success.main' : 'text.secondary' }}>
                        Keywords to add: {validCount}
                    </Typography>
                </Box>

                <TextField
                    placeholder="Enter keywords here..."
                    multiline
                    minRows={8}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value.toLowerCase())}
                    error={!!error}
                    helperText={error}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="keyword-group-label">Keyword Groups</InputLabel>
                    <Select
                        labelId="keyword-group-label"
                        multiple
                        value={selectedGroups}
                        label="Keyword Groups"
                        onChange={handleGroupChange}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                    const group = keywordGroups.find(g => g.id === value);
                                    if (!group) return null;
                                    const bgColor = group.color || '#ccc';
                                    return (
                                        <Chip
                                            key={value}
                                            label={group.name}
                                            size="small"
                                            sx={{
                                                backgroundColor: bgColor,
                                                color: tinycolor(bgColor).isLight() ? '#000' : '#fff',
                                                height: 22
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                        MenuProps={{
                            PaperProps: { style: { maxHeight: 250 } },
                        }}
                    >
                        {keywordGroups.map((group) => {
                            const isChecked = selectedGroups.indexOf(group.id) > -1;
                            const bgColor = group.color || '#ccc';

                            return (
                                <MenuItem key={group.id} value={group.id}>
                                    <Checkbox checked={isChecked} size="small" />
                                    <ListItemText>
                                        <Chip
                                            label={group.name}
                                            size="small"
                                            sx={{
                                                backgroundColor: bgColor,
                                                color: tinycolor(bgColor).isLight() ? '#000' : '#fff',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </ListItemText>
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