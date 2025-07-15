import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar() {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar />
            <List>
                <ListItem button component={Link} to="/dashboard">
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>

                {/* Add more links here */}
            </List>
        </Drawer>
    );
}