import React, {useState} from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import type { CountryOption } from '../../types/locationTypes';
import locationService from '../../../services/locationService';

interface Props {
    value: CountryOption | null;
    onChange: (val: CountryOption | null) => void;
}

const CountrySelect: React.FC<Props> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<CountryOption[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        if (options.length) return; // avoid refetch on every open
        setLoading(true);
        try {
            const res = await locationService.getCountries();
            // adjust if your service returns {data: CountryOption[]}
            setOptions(Array.isArray(res) ? res : res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setOptions([]);
    };

    return (
        <Autocomplete
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            options={options}
            loading={loading}
            value={value}
            onChange={(_, newVal) => onChange(newVal)}
            getOptionLabel={(option) => option.label ?? ''}
            isOptionEqualToValue={(option, val) => option.value === (val?.value ?? '')}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <Box key={key} component="li" {...rest}>
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
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Country"
                    slotProps={{
                        htmlInput : {...params.inputProps, autoComplete: 'new-password'}
                    }}
                />
            )}
        />
    );
};

export default CountrySelect;