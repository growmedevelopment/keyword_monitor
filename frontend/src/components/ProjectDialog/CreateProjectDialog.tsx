import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Button
} from '@mui/material';
import type {Project, CountryOption} from '../types/locationTypes';
import CitySelect from './CitySelect';
import CountrySelect from './CountrySelect';
import locationService from '../../services/locationService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Project) => void;
}

export default function CreateProjectDialog({ isOpen, onClose, onCreate }: Props) {
    const [data, setData] = useState<Project>({
        id: 0,
        name: '',
        url: '',
        country: '',
        location_code: 0
    });
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof Project, value: string | number) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleCountryChange = (country: CountryOption | null) => {
        setSelectedCountry(country);
        handleChange('country', country?.value || '');
        handleChange('location_code', 0);
    };

    const handleCityChange = (code: number) => handleChange('location_code', code);

    const handleSubmit = () => {
        const { name, url, country, location_code } = data;
        if (!name || !url || !country || !location_code) return;

        setLoading(true);
        try {
            onCreate({ ...data, id: 0 });
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
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Project URL"
                    fullWidth
                    value={data.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                />
                <CountrySelect value={selectedCountry} onChange={handleCountryChange} />
                <CitySelect
                    value={data.location_code}
                    onChange={handleCityChange}
                    countryCode={data.country}
                    fetchCities={locationService.getCities}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}