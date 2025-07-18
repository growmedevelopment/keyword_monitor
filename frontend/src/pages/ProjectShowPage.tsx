import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import projectService from '../services/projectService';
import KeywordTable from '../components/Tables/KeywordTable';
import type {Project} from "../components/types/projectTypes.ts";


export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        projectService.getById(id)
            .then((response) => {
                setProject(response);
            })
            .catch((err) => {
                console.error('Failed to fetch project', err);
                setError('Failed to load project');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!project) return <Typography>No project found</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>{project.name}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
                {project.url}
            </Typography>

            <Paper sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6">Assigned Keywords</Typography>
                <KeywordTable keywords={project.keywords} />
            </Paper>
        </Box>
    );
}