import * as React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from "../components/Sidebar.tsx";
import GrowMeLogo from "../components/Common/GrowMeLogo.tsx";
import {Toaster} from "react-hot-toast";

/**
 * AppLayout
 * - Isolates global navigation & structure
 * - Renders a top AppBar and the provided Sidebar
 * - Hosts the main routed content via {children}
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuToggle = () => setMobileOpen((s) => !s);
    const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    return (
        <Box sx={{display: 'flex', minHeight: '100svh', bgcolor: (t) => t.palette.background.default}}>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />

            {/* Left Navigation (your existing component). If it supports temporary mode, pass mobileOpen + onClose */}
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/>

            {/* Top Bar */}
            <AppBar
                position="fixed"
                color="default"
                elevation={1}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backdropFilter: 'saturate(180%) blur(6px)',
                    bgcolor: (t) => (t.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(18,18,18,0.9)'),
                }}
            >
                <Toolbar sx={{gap: 1}}>

                    <GrowMeLogo/>
                    {/* Mobile-only button to open Sidebar */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleMenuToggle}
                        aria-label="Open navigation"
                        sx={{display: {xs: 'inline-flex', md: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" noWrap sx={{fontWeight: 700, letterSpacing: 0.2, flexGrow: 1}}>
                        Dashboard
                    </Typography>

                    {/* Simple profile menu placeholder */}
                    <Tooltip title="Account">
                        <IconButton onClick={handleAvatarClick} size="small" sx={{ml: 1}}>
                            <Avatar sx={{width: 34, height: 34}}>U</Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                    >
                        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Sign out</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Main area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    // Leave space for AppBar
                    mt: {xs: '64px', sm: '64px'}, // default AppBar height
                    p: {xs: 2, sm: 3},
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.background.default),
                }}
            >
                {/* Optional page container for nicer max width */}
                <Container maxWidth="xl" disableGutters>
                    {children}
                </Container>
            </Box>
        </Box>
    );
}