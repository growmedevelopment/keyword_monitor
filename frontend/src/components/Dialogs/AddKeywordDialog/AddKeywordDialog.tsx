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
    InputLabel, Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import keywordGroupService from "../../../services/keywordGroupService.ts";
import type {KeywordGroup} from "../../types/keywordTypes.ts";
import tinycolor from 'tinycolor2'
import {useParams} from "react-router-dom";

interface Props {
    onClose: () => void;
    onSubmit: (keywords: string[], groupId: number | null) => void;
}

export default function AddKeywordDialog({ onClose, onSubmit }: Props) {
    const {id} = useParams<{ id: string }>();
    const [input, setInput] = useState('');
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await keywordGroupService.getByProject( parseInt(id ?? '0', 10));
            setKeywordGroups(groups);
        };
        fetchGroups().then();
    }, []);

    const handleSubmit = () => {
        const keywords = input
            .split('\n')
            .map(k => k.trim())
            .filter(k => k.length > 0);
        if (keywords.length > 0) {
            onSubmit(keywords, selectedGroup);
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
                <TextField
                    placeholder="Enter keywords here..."
                    multiline
                    minRows={10}
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value.toLowerCase())}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="keyword-group-label">Keyword Group</InputLabel>
                    <Select
                        labelId="keyword-group-label"
                        value={selectedGroup ?? ''}
                        label="Keyword Group"
                        onChange={(e) => setSelectedGroup(Number(e.target.value))}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                },
                            },
                        }}
                    >
                        <MenuItem value="">None</MenuItem>
                        {keywordGroups.map((group) => {
                            const bgColor = group.color || '#ccc';
                            const textColor = tinycolor(bgColor).isLight() ? '#000' : '#fff';

                            return (
                                <MenuItem key={group.id} value={group.id}>
                                    <Chip
                                        label={group.name}
                                        sx={{
                                            backgroundColor: bgColor,
                                            color: textColor,
                                            fontWeight: 500,
                                            paddingX: 1.5,
                                            paddingY: 0.5,
                                            borderRadius: 1,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
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
                <Button onClick={handleSubmit} variant="contained">Add</Button>
            </DialogActions>
        </Dialog>
    );
}
