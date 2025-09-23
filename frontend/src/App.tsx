import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectShowPage from './pages/ProjectShowPage';
import KeywordShowPage from './pages/KeywordShowPage';
import UserRegisterPage from './pages/UserRegisterPage';
import UserLoginPage from './pages/UserLoginPage';
import KeywordGroupPage from './pages/KeywordGroupsPage.tsx';
import ProjectsArchivedPage from "./pages/ProjectsArchivedPage";
import { useAuth } from './context/AuthContext';
import AppLayout from "./layouts/AppLayout.tsx";


export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'grid',
                    placeItems: 'center',
                    height: '100svh',
                    bgcolor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.background.default,
                }}
            >
                <CircularProgress size={48} thickness={4} />
            </Box>
        );
    }

    return (
        <>
            <CssBaseline />

            {user ? (
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/projects/archived" element={<ProjectsArchivedPage />} />
                        <Route path="/projects/:id" element={<ProjectShowPage />} />
                        <Route path="/keywords/:id" element={<KeywordShowPage />} />
                        <Route path="/keyword-groups/" element={<KeywordGroupPage />} />
                        <Route path="/register" element={<UserRegisterPage />} />
                        {/* Already authenticated: redirect away from /login */}
                        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                        {/* Catch-all to dashboard */}
                        <Route path="/*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AppLayout>
            ) : (
                // PUBLIC (UNAUTHENTICATED) AREA — centered, soft background
                <Box
                    sx={{
                        display: 'grid',
                        placeItems: 'center',
                        minHeight: '100svh',
                        bgcolor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.background.default,
                        p: { xs: 2, md: 4 },
                    }}
                >
                    <Routes>
                        <Route path="/login" element={<UserLoginPage />} />
                        <Route path="/register" element={<UserRegisterPage />} />
                        {/* Send everything else to login */}
                        <Route path="/*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Box>
            )}
        </>
    );
}