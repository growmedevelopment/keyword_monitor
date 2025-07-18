import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import projectService from '../services/projectService';
import KeywordTable from '../components/Tables/KeywordTable';
import AddKeywordDialog from '../components/KeywordDialog/AddKeywordDialog';
import type { Project } from '../components/types/projectTypes';
import keywordService from "../services/keywordService.ts";

export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        projectService.getById(id)
            .then(setProject)
            .catch((err) => {
                console.error('Failed to fetch project', err);
                setError('Failed to load project');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddKeyword = (newKeyword: string) => {
        if (!project || !id) return;

        keywordService.create(id, newKeyword).then((updatedProject) => {
            setProject(updatedProject);
            setDialogOpen(false);
        });
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!project) return <Typography>No project found</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>{project.name}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">{project.url}</Typography>

            <Paper sx={{ mt: 3, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Assigned Keywords</Typography>
                    <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
                        Add Keyword
                    </Button>
                </Box>

                <KeywordTable keywords={project.keywords} />
            </Paper>

            <AddKeywordDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={(keywords) => {
                    console.log('Submitted keywords:', keywords);
                }}
            />
        </Box>
    );
}