import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import projectService from '../services/projectService';
import KeywordTable from '../components/Tables/KeywordTable';
import AddKeywordDialog from '../components/KeywordDialog/AddKeywordDialog';
import type { Project } from '../components/types/projectTypes';
import keywordService from '../services/keywordService.ts';

export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

    // Initial fetch + polling
    useEffect(() => {
        if (!id) return;

        // First load
        projectService.getById(id)
            .then(setProject)
            .catch((err) => {
                console.error('Failed to fetch project', err);
                setError('Failed to load project');
            })
            .finally(() => setLoading(false));

        // Poll every 10s ONLY if there are non-completed keywords
        const interval = setInterval(() => {
            setProject((prev) => {
                // Skip polling if all keywords are completed
                if (prev && prev.keywords.every(k => k.status === 'Completed')) return prev;

                projectService.getById(id)
                    .then((freshProject) => setProject(freshProject))
                    .catch((err) => console.error("Polling failed", err));

                return prev;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [id]);

    // Add keyword and optimistically show it in UI
    const handleAddKeyword = (newKeywords: string[]) => {
        if (!project || !id) return;

        newKeywords.forEach((newKeyword) => {
            keywordService.create(id, newKeyword)
                .then((response) => {
                    const createdKeyword = {
                        ...response.keyword,
                        status: response.keyword.status ?? 'Queued', // fallback
                        data_for_seo_results: response.keyword.data_for_seo_results ?? []
                    };

                    // Optimistic update
                    setProject((prev) =>
                        prev
                            ? { ...prev, keywords: [...prev.keywords, createdKeyword] }
                            : prev
                    );
                })
                .catch((err) => console.error("Keyword creation failed", err));
        });

        setDialogOpen(false);
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!project) return <Typography>No project found</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>{project.name}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">{project.url}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">{project.country}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">{project.location_code}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">{project.created_at}</Typography>

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
                onSubmit={handleAddKeyword}
            />
        </Box>
    );
}