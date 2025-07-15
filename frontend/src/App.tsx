import { CssBaseline, Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'

export default function App() {
    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Dashboard />
                </Box>
            </Box>
        </>
    )
}