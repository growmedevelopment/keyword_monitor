import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import type { CountryOption } from '../../types/locationTypes.ts';
import CitySelect from './CitySelect.tsx';
import CountrySelect from './CountrySelect.tsx';
import locationService from '../../../services/locationService.ts';
import type {ProjectLocationUpdate} from "../../types/projectTypes.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (location: ProjectLocationUpdate) => void;
    initialCountry?: string;
    initialLocationCode?: number;
}

export default function UpdateLocationDialog({ isOpen, onClose, onUpdate }: Props) {
    const [country, setCountry] = useState<string>('');
    const [locationData, setLocationData] = useState({ code: 0, name: '' });
    const [selectedCountryObj, setSelectedCountryObj] = useState<CountryOption | null>(null);

    const handleCountryChange = (countryOpt: CountryOption | null) => {
        setSelectedCountryObj(countryOpt);
        setCountry(countryOpt?.value || '');
        setLocationData({ code: 0, name: '' });
    };

    const handleCityChange = (city: { code: number; name: string }) => {
        setLocationData(city);
    };

    const handleSubmit = () => {
        if (!country || !locationData.code) return;
        onUpdate({
            country,
            location_code: locationData.code,
            location_name: locationData.name
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Update Location</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <CountrySelect
                        value={selectedCountryObj}
                        onChange={handleCountryChange}
                    />

                    <CitySelect
                        value={locationData.code}
                        onChange={handleCityChange}
                        countryCode={country}
                        fetchCities={locationService.getCities}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!country || !locationData.code}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}