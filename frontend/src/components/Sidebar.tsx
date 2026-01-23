import * as React from 'react';
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar,
    Divider, Box, Tooltip, Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {UpdateTasksNavItem} from "./Admin/UpdateTasksNavItem.tsx";

const drawerWidth = 240;

type SidebarProps = {
    mobileOpen?: boolean;
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

    const isSelected = (to: string) =>
        pathname === to || (to !== '/' && pathname.startsWith(to));

    const NavItem = ({
                         to,
                         icon,
                         label,
                         inset = false,
                     }: {
        to: string;
        icon: React.ReactElement;
        label: string;
        inset?: boolean;
    }) => {
        const selected = isSelected(to);
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
                        pl: inset ? 6 : 2,
                        '&.Mui-selected': (t) => ({
                            backgroundColor:
                                t.palette.mode === 'light'
                                    ? t.palette.primary.light + '30'
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

    // --- Projects collapsible state (open if you're anywhere under /projects)
    const [projectsOpen, setProjectsOpen] = React.useState(
        pathname === '/projects' || pathname.startsWith('/projects/')
    );
    React.useEffect(() => {
        if (pathname.startsWith('/projects')) setProjectsOpen(true);
    }, [pathname]);

    const ProjectsGroup = () => {
        const parentSelected = isSelected('/projects');

        return (
            <>
                {/* Parent row */}
                <ListItemButton
                    onClick={() => setProjectsOpen((v) => !v)}
                    aria-expanded={projectsOpen ? 'true' : 'false'}
                    aria-controls="projects-nav-children"
                    sx={{
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        '&.Mui-selected': (t) => ({
                            backgroundColor:
                                t.palette.mode === 'light'
                                    ? t.palette.primary.light + '30'
                                    : t.palette.primary.dark + '50',
                        }),
                    }}
                    selected={parentSelected}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="Projects" />
                    {projectsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                {/* Children */}
                <Collapse in={projectsOpen} timeout="auto" unmountOnExit>
                    <List id="projects-nav-children" component="div" disablePadding sx={{ px: 0.5 }}>
                        <NavItem
                            to="/projects"
                            icon={<ChevronRightIcon fontSize="small" />}
                            label="All Projects"
                            inset
                        />
                        <NavItem
                            to="/projects/archived"
                            icon={<ChevronRightIcon fontSize="small" />}
                            label="Archived"
                            inset
                        />

                    </List>
                </Collapse>
            </>
        );
    };

    const content = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} role="navigation" aria-label="Primary">
            <Toolbar />
            <List sx={{ px: 0.5 }}>
                <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
                <ProjectsGroup />
                <UpdateTasksNavItem/>
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ my: 1 }} />
            <List sx={{ px: 0.5 }}>
                <Tooltip title="Log out" placement="right" enterDelay={800}>
                    <ListItemButton onClick={handleLogout} sx={{ mx: 1, my: 0.5, borderRadius: 1 }}>
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
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                {content}
            </Drawer>

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
                        borderRight: (t) => `1px solid ${
                            t.palette.mode === 'light' ? t.palette.grey[200] : t.palette.divider
                        }`,
                    },
                }}
            >
                {content}
            </Drawer>
        </>
    );
}