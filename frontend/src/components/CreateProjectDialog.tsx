import React, {useEffect, useState} from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField
} from '@mui/material';

import locationService  from '../services/locationService';

interface Project {
    id: number;
    name: string;
    url: string;
    country: string;
    location_code: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Project) => void;
}

export default function CreateProjectDialog({ isOpen, onClose, onCreate }: Props) {

    const [data, setData] = useState({
        name: '',
        url: '',
        country: '',
        location_code: ''
    });
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]);

    // getting all locations from API
    useEffect(() => {
        locationService.getAll().then(setLocations).catch(console.error);
    }, []);

    function handleDataState(dataName: string, dataValue: string) {
        setData(prev => ({
            ...prev,
            [dataName]: dataValue,
        }));
    }

    const handleSubmit = async () => {
        if (!data.name || !data.url) return;

        setLoading(true);
        try {
            onCreate(data as Project);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Project Name"
                    fullWidth
                    value={data.name}
                    onChange={(event) =>{handleDataState('name', event.target.value )}}
                    // error={!!errors.name}
                    // helperText={errors.name?.[0]}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Project url"
                    fullWidth
                    value={data.url}
                    onChange={(event) =>{handleDataState('url', event.target.value )}}
                    // error={!!errors.url}
                    // helperText={errors.url?.[0]}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>Create</Button>
            </DialogActions>
        </Dialog>
    );
};

