import { CssBaseline, Box } from '@mui/material'
import {Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ProjectsPage from './pages/ProjectsPage'
import UserRegisterPage from "./pages/UserRegisterPage.tsx";
import UserLoginPage from "./pages/UserLoginPage.tsx";

export default function App() {
    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/register" element={<UserRegisterPage />} />
                        <Route path="/login" element={<UserLoginPage />} />
                    </Routes>
                </Box>
            </Box>
        </>
    )
}