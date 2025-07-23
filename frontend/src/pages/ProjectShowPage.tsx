import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Skeleton,
    Chip
} from '@mui/material';

import PublicIcon from '@mui/icons-material/Public';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import projectService from '../services/projectService';
import keywordService from '../services/keywordService.ts';
import KeywordTable from '../components/Tables/KeywordTable';
import AddKeywordDialog from '../components/KeywordDialog/AddKeywordDialog';
import type { Project } from '../components/types/projectTypes';

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
        projectService
            .getById(id)
            .then(setProject)
            .catch((err) => {
                console.error('Failed to fetch project', err);
                setError('Failed to load project');
            })
            .finally(() => setLoading(false));

        // Poll every 10s if there are pending keywords
        const interval = setInterval(() => {
            setProject((prev) => {
                if (prev && prev.keywords.every((k) => k.status === 'Completed')) return prev;

                projectService
                    .getById(id)
                    .then((freshProject) => setProject(freshProject))
                    .catch((err) => console.error('Polling failed', err));

                return prev;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [id]);

    // Add keyword and optimistically show it in UI
    const handleAddKeyword = (newKeywords: string[]) => {
        if (!project || !id) return;

        newKeywords.forEach((newKeyword) => {
            keywordService
                .create(id, newKeyword)
                .then((response) => {
                    const createdKeyword = {
                        ...response.keyword,
                        status: response.keyword.status ?? 'Queued',
                        data_for_seo_results: response.keyword.data_for_seo_results ?? []
                    };

                    // Optimistic update
                    setProject((prev) =>
                        prev ? { ...prev, keywords: [...prev.keywords, createdKeyword] } : prev
                    );
                })
                .catch((err) => console.error('Keyword creation failed', err));
        });

        setDialogOpen(false);
    };

    if (loading) {
        return (
            <Box p={3}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
            </Box>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;
    if (!project) return <Typography>No project found</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                {project.name}
            </Typography>

            {/* Project Info */}
            <Box mb={2}>
                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <LanguageIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Website"
                            secondary={
                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                    {project.url}
                                </a>
                            }
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <PublicIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Country" secondary={project.country} />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <LocationOnIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Location" secondary={project.location_name} />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <CalendarTodayIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Created At"
                            secondary={new Date(project.created_at).toLocaleString()}
                        />
                    </ListItem>
                </List>
            </Box>

            {/* Keywords Section */}
            <Paper sx={{ mt: 3, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Assigned Keywords</Typography>
                    <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
                        Add Keyword
                    </Button>
                </Box>

                <KeywordTable keywords={project.keywords} />
            </Paper>

            {/* Add Keyword Modal */}
            <AddKeywordDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleAddKeyword}
            />
        </Box>
    );
}