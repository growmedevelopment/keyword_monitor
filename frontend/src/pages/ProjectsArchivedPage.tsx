import { Suspense, useEffect, useState } from 'react';
import { Stack, Typography, CircularProgress, Paper, List, ListItem, ListItemText } from '@mui/material';
import projectService from '../services/projectService';
import type { Project } from '../components/types/projectTypes';
import toast from "react-hot-toast";

export default function ProjectsArchivedPage() {
    const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        projectService
            .getArchived()
            .then((data) => setArchivedProjects(data))
            .catch((error) => {
                toast.error(error?.response?.data?.message || "Failed to fetch archived projects.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <Suspense fallback={<CircularProgress />}>
            <Stack spacing={3} sx={{ py: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>Archived Projects</Typography>

                {loading ? (
                    <CircularProgress />
                ) : archivedProjects.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            You don’t have any archived projects yet.
                        </Typography>
                    </Paper>
                ) : (
                    <List>
                        {archivedProjects.map((project) => (
                            <ListItem key={project.id} divider>
                                <ListItemText
                                    primary={project.name}
                                    secondary={`Archived on ${new Date(project.archived_at).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Stack>
        </Suspense>
    );
}