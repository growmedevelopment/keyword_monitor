import { useState } from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button} from '@mui/material';
import type {Project} from "../../types/projectTypes.ts";
import type {CountryOption} from '../../types/locationTypes.ts';
import CitySelect from './CitySelect.tsx';
import CountrySelect from './CountrySelect.tsx';
import locationService from '../../../services/locationService.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Project) => void;
}

export default function CreateProjectDialog({ isOpen, onClose, onCreate }: Props) {

    const [data, setData] = useState<Project>({
        keywords: [],
        id: Date.now(),
        name: '',
        url: '',
        country: '',
        location_code: 0,
        created_at: '',
        location_name: '',
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
            onCreate({ ...data});
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