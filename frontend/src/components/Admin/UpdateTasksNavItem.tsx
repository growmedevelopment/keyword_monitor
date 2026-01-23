import  { useEffect, useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import adminService from '../../services/adminService';

export const UpdateTasksNavItem = () => {
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    // 1. Check status when component loads
    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const data = await adminService.checkPendingTasks();
            setPendingCount(data.pending_count);
        } catch (error) {
            console.error("Could not check task status", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle the click
    const handleClick = async () => {
        if (pendingCount === 0) return;

        setLoading(true);
        try {
            await adminService.updateCreatedTasks();
            alert("Update started!");
            // Re-check status or optimistically set to 0
            setPendingCount(0);
        } catch (error) {
            alert("Failed to start update.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Logic: If count is 0, button is disabled
    const isDisabled = loading || pendingCount === 0;

    return (
        <ListItemButton
            onClick={handleClick}
            disabled={isDisabled}
            sx={{ px: 2.5 }}
        >
            <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>
                {/* Show a Checkmark if everything is done, otherwise the Update icon */}
                {pendingCount === 0 && !loading ? <CheckCircleIcon color="success" /> : <UpdateIcon />}
            </ListItemIcon>

            <ListItemText
                primary={pendingCount > 0 ? "Update Created Tasks" : "All Tasks Up to Date"}
                secondary={pendingCount > 0 ? `${pendingCount} tasks pending` : null}
            />
        </ListItemButton>
    );
};