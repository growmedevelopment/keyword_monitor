import * as React from 'react';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Box,
    Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

type SidebarProps = {
    /** Controls the mobile (temporary) drawer open state */
    mobileOpen?: boolean;
    /** Closes the mobile drawer (passed from layout) */
    onClose?: () => void;
};

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        navigate('/login', { replace: true });
        onClose?.();
    };

    const NavItem = ({
                         to,
                         icon,
                         label,
                     }: {
        to: string;
        icon: React.ReactElement;
        label: string;
    }) => {
        const selected = pathname === to || (to !== '/' && pathname.startsWith(to));
        return (
            <Tooltip title={label} placement="right" enterDelay={800}>
                <ListItemButton
                    component={RouterLink}
                    to={to}
                    selected={selected}
                    onClick={() => onClose?.()}
                    aria-current={selected ? 'page' : undefined}
                    sx={{
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        '&.Mui-selected': (t) => ({
                            backgroundColor:
                                t.palette.mode === 'light'
                                    ? t.palette.primary.light + '30' // subtle tint
                                    : t.palette.primary.dark + '50',
                        }),
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
                    <ListItemText primary={label} />
                </ListItemButton>
            </Tooltip>
        );
    };

    const content = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
            role="navigation"
            aria-label="Primary"
        >
            <Toolbar />
            <List sx={{ px: 0.5 }}>
                <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
                <NavItem to="/projects" icon={<FolderIcon />} label="Projects" />
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ my: 1 }} />
            <List sx={{ px: 0.5 }}>
                <Tooltip title="Log out" placement="right" enterDelay={800}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ mx: 1, my: 0.5, borderRadius: 1 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Log out" />
                    </ListItemButton>
                </Tooltip>
            </List>
        </Box>
    );

    return (
        <>
            {/* Temporary drawer for mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }} // better performance on mobile
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {content}
            </Drawer>

            {/* Permanent drawer for md+ */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: (t) =>
                            `1px solid ${
                                t.palette.mode === 'light'
                                    ? t.palette.grey[200]
                                    : t.palette.divider
                            }`,
                    },
                }}
            >
                {content}
            </Drawer>
        </>
    );
}