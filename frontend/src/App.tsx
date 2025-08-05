import { CssBaseline, Box } from '@mui/material'
import {Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ProjectsPage from './pages/ProjectsPage'
import UserRegisterPage from "./pages/UserRegisterPage.tsx";
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import UserLoginPage from "./pages/UserLoginPage.tsx";
import ProjectShowPage from "./pages/ProjectShowPage.tsx";
import KeywordShowPage from "./pages/KeywordShowPage.tsx";

export default function App() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <CssBaseline />
            {user ? (
                <Box sx={{ display: 'flex' }}>
                    <Sidebar />
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/projects/:id" element={<ProjectShowPage />} />
                            <Route path="/keywords/:id" element={<KeywordShowPage />} />
                            <Route path="/register" element={<UserRegisterPage />} />
                            <Route path="/login" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Routes>
                    </Box>
                </Box>
            ) : (
                <Routes>
                    <Route path="/*" element={<Navigate to="/login" replace/>} />
                    <Route path="/login" element={<UserLoginPage/>} />
                    <Route path="/register" element={<UserRegisterPage />} />
                </Routes>
            )}
        </>
    );
}