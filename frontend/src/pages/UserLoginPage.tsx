import * as React from 'react';
import { useState } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext.tsx';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    TextField,
    Typography,
    Alert,
    LinearProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT as string;

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function UserLoginPage() {
    const [form, setForm] = useState<LoginForm>({ email: '', password: '', remember: false });
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { login } = useAuth();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validate = (values: LoginForm) => {
        const errors: Partial<Record<keyof LoginForm, string>> = {};
        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
            errors.email = 'Enter a valid email';
        }
        if (!values.password) {
            errors.password = 'Password is required';
        } else if (values.password.length < 6) {
            errors.password = 'At least 6 characters';
        }
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const errors = validate(form);
        if (Object.keys(errors).length > 0) {
            // surface the first error inline using TextField helperText—no global error here
            // but set a general error for screen readers/visibility
            setError('Please fix the highlighted fields.');
            return;
        }

        setSubmitting(true);
        try {
            // 1) Get CSRF cookie (Laravel Sanctum)
            await axios.get(`${API}/sanctum/csrf-cookie`, { withCredentials: true });

            // 2) Attempt login
            const res = await axios.post(
                `${API}/api/login`,
                { email: form.email, password: form.password, remember: form.remember },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                },
            );

            const token = res.data?.token;
            const user = res.data?.user;

            if (!token || !user) {
                throw new Error('Malformed response from server');
            }

            login(user, token);

            // If you want to redirect here, uncomment:
            // window.location.href = '/';
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Login failed';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldErrors = validate(form);

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'grid', placeItems: 'center', minHeight: '100svh' }}>
            <Paper
                elevation={6}
                sx={{
                    width: '100%',
                    p: { xs: 3, sm: 4 },
                    borderRadius: 3,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                        Sign in
                    </Typography>

                    {submitting && (
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <TextField
                            fullWidth
                            required
                            id="email"
                            name="email"
                            label="Email address"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            value={form.email}
                            onChange={handleChange}
                            error={Boolean(form.email) ? Boolean(fieldErrors.email) : false}
                            helperText={Boolean(form.email) && fieldErrors.email ? fieldErrors.email : ' '}
                            slotProps={{
                                htmlInput : { 'aria-label': 'email address' }
                            }}
                        />

                        <TextField
                            fullWidth
                            required
                            id="password"
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={form.password}
                            onChange={handleChange}
                            error={Boolean(form.password) ? Boolean(fieldErrors.password) : false}
                            helperText={Boolean(form.password) && fieldErrors.password ? fieldErrors.password : ' '}
                            slotProps={{
                                htmlInput: {'aria-label': 'password'},
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                onClick={() => setShowPassword((s) => !s)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="remember"
                                    color="primary"
                                    checked={form.remember}
                                    onChange={handleChange}
                                />
                            }
                            label="Remember me"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={submitting}
                            sx={{ mt: 1, py: 1.2, textTransform: 'none', fontWeight: 600 }}
                        >
                            {submitting ? 'Signing in…' : 'Sign in'}
                        </Button>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'start', sm: 'center' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                mt: 1,
                                gap: 1,
                            }}
                        >
                            <Link href="/forgot-password" variant="body2" underline="hover">
                                Forgot password?
                            </Link>
                            <Typography variant="body2" color="text.secondary">
                                Don’t have an account?{' '}
                                <Link href="/register" underline="hover">
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}