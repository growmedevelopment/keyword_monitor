import React from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import type {CountryOption} from '../../types/locationTypes.ts';

interface Props {
    value: CountryOption | null;
    onChange: (val: CountryOption | null) => void;
}

const countries: CountryOption[] = [
    { label: 'Canada', value: 'CA' },
    { label: 'United States', value: 'US' }
];

const CountrySelect: React.FC<Props> = ({ value, onChange }) => (
    <Autocomplete
        options={countries}
        value={value}
        onChange={(_, newVal) => onChange(newVal)}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, val) => option.value === val.value}
        renderOption={(props, option) => (
            <Box component="li" {...props}>
                <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${option.value.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${option.value.toLowerCase()}.png 2x`}
                    alt=""
                    style={{ marginRight: 8 }}
                />
                {option.label} ({option.value})
            </Box>
        )}
        renderInput={(params) => (
            <TextField
                {...params}
                label="Country"
                inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password'
                }}
            />
        )}
    />
);

export default CountrySelect;