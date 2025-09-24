import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box, Stack} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import toast from 'react-hot-toast';
import keywordGroupService from '../../../services/keywordGroupService.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate?: (data: {
        name: string;
        color: string;
        project_id: number }) => void;
}

export default function CreateKeywordGroupDialog({ isOpen, onClose, onCreate }: Props) {
    const { id } = useParams<{ id: string }>();
    const [form, setForm] = useState<{ name: string; color: string; project_id: number }>({
        name: '',
        color: '#ffffff',
        project_id: parseInt(id ?? '0', 10),
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: 'name' | 'color', value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.color) {
            toast.error('Please fill in both name and color.');
            return;
        }

        setLoading(true);
        try {
            const response = await keywordGroupService.create(form);
            toast.success(response.message || 'Keyword group created');

            setForm({ name: '', color: '#ffffff', project_id: parseInt(id ?? '0', 10) });
            onClose();
            onCreate?.(form);
        } catch (err: any) {
            toast.error(err.response?.data?.details || 'Failed to create keyword group.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} aria-labelledby="create-keyword-group-dialog">
            <DialogTitle id="create-keyword-group-dialog">Add Keyword Group</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3} mt={1}>
                        <TextField
                            label="Group Name"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            fullWidth
                            required
                        />
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Group Color
                            </Typography>
                            <MuiColorInput
                                format="hex"
                                value={form.color}
                                onChange={value => handleChange('color', value)}
                            />
                        </Box>
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
                    Add Group
                </Button>
            </DialogActions>
        </Dialog>
    );
}