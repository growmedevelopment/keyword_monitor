import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import type { CityOption } from '../types/locationTypes';

//  Cache declared outside the component
const cityCache = new Map<string, CityOption[]>();

interface Props {
    value: number;
    onChange: (val: number) => void;
    countryCode: string;
    fetchCities: (code: string) => Promise<CityOption[]>;
}

const CitySelect: React.FC<Props> = ({ value, onChange, countryCode, fetchCities }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<CityOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<CityOption | null>(null);

    // Clear selection when country changes
    useEffect(() => {
        setSelected(null);
        setOptions([]);
        onChange(0);
    }, [countryCode]);

    // Fetch or use cached cities on open + valid countryCode
    useEffect(() => {
        if (open && countryCode) {
            if (cityCache.has(countryCode)) {
                setOptions(cityCache.get(countryCode)!);
                return;
            }

            setLoading(true);
            fetchCities(countryCode).then((cities) => {
                cityCache.set(countryCode, cities); // cache the results
                setOptions(cities);
                setLoading(false);
            });
        }
    }, [open, countryCode]);

    useEffect(() => {
        const match = options.find(opt => opt.value === value) || null;
        setSelected(match);
    }, [value, options]);

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            options={options}
            disabled={!countryCode}
            loading={loading}
            value={selected}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            onChange={(_, newVal) => newVal && onChange(newVal.value)}
            renderOption={(props, option) => (
                <li {...props} key={option.value}>
                    {option.label}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="City"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && <CircularProgress size={20} />}
                                {params.InputProps.endAdornment}
                            </>
                        )
                    }}
                />
            )}
        />
    );
};

export default CitySelect;