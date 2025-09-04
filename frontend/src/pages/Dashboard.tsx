import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Alert,
    Stack,
    Button,
    Divider,
    useTheme,
    alpha, Grid,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyIcon from '@mui/icons-material/Key';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink } from 'react-router-dom';

import dashboardService from '../services/dashboardService';
import type { Dashboard } from '../components/types/dashboardTypes';
import StatCard from '../components/Dashboard/StatCard';
import {useCallback, useEffect, useState} from "react";

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function Dashboard() {
    const theme = useTheme();
    const [state, setState] = useState<LoadState>('idle');
    const [data, setData] = useState<Dashboard | null>(null);
    const [error, setError] = useState<string>('');

    const fetchData = useCallback(async () => {
        setState('loading');
        setError('');
        try {
            const res = await dashboardService.getGeneralData();
            setData(res);
            setState('success');
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard data.');
            setState('error');
        }
    }, []);

    useEffect(() => {
        void fetchData(); // fire-and-forget; no cleanup needed
    }, [fetchData]);

    const loading = state === 'loading';

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {loading ? 'Fetching your latest metrics…' : data?.message || 'Welcome back.'}
                    </Typography>
                </Box>

            </Stack>

            {state === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: '20px' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Projects"
                        value={data?.projects_amount ?? 0}
                        loading={loading}
                        icon={<FolderOpenIcon fontSize="inherit" />}
                        color={theme.palette.primary.main}
                        subtitle="Total projects you own"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Keywords"
                        value={data?.keywords_amount ?? 0}
                        loading={loading}
                        icon={<KeyIcon fontSize="inherit" />}
                        color={theme.palette.secondary.main}
                        subtitle="All keywords across your projects"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            bgcolor:
                                theme.palette.mode === 'light'
                                    ? theme.palette.common.white
                                    : alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'saturate(180%) blur(4px)',
                            height: '100%',
                        }}
                    >
                        <CardHeader
                            title={
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Get started quickly
                                </Typography>
                            }
                            subheader="Shortcuts to common actions"
                        />
                        <Divider />
                        <CardContent>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to="/projects"
                                    startIcon={<AddIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    New project
                                </Button>
                                <Button
                                    variant="outlined"
                                    component={RouterLink}
                                    to="/projects"
                                    startIcon={<VisibilityIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Browse projects
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}