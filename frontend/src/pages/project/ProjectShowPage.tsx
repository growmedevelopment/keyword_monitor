import {useCallback, useEffect, useState} from "react";
import {Link as RouterLink, useParams} from "react-router-dom";
import {Badge, Box, CardActionArea, Grid, Paper, Stack, Typography} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import projectService from "../../services/projectService.ts";
import type {Project, ProjectLocationUpdate} from "../../components/types/projectTypes.ts";
import ProjectDetails from "../../components/Project/ProjectDetails.tsx";
import DataStateHandler from "../../components/Common/DataStateHandler.tsx";
import BackButton from "../../components/Common/BackButton.tsx";
import toast from "react-hot-toast";


export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProject = useCallback(() => {
        if (!id) return;
        setLoading(true);
        projectService
            .getById(id)
            .then(setProject)
            .catch(() => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id]);

    const updateProjectLocation = useCallback(async (locationData: ProjectLocationUpdate) => {
        if (!id || !project) return;

        const updatePromise = projectService.updateLocation(project.id, locationData);

        await toast.promise(updatePromise, {
            loading: 'Updating location...',
            success: (response) => {
                setProject(response.project);
                return response.message || "Location updated successfully!";
            },
            error: (err) => {
                return err?.response?.data?.message || err?.response?.data?.error || "Failed to update location";
            }
        });

        try {
            await updatePromise;
        } catch (error) {
            console.error("Update failed:", error);
        }
    }, [id, project]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', margin: '0 auto' }}>
            <Box mb={3}>
                <BackButton />
            </Box>

            <DataStateHandler<Project>
                loading={loading}
                error={error}
                data={project}
                emptyMessage="No project found"
            >
                {(projectData: Project) => (
                    <>
                        {/* Header Section */}
                        <Box sx={{ mb: 6, textAlign: 'center' }}>

                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    color: '#1e293b',
                                    mt: 1,
                                    textTransform: "capitalize",
                                }}
                            >
                                {projectData.name}
                            </Typography>
                            <Box sx={{ width: 60, height: 4, bgcolor: 'primary.main', mx: 'auto', mt: 2, borderRadius: 2 }} />
                        </Box>

                        <Grid container spacing={4}>
                            {/* Left Side: Details */}
                            <Grid size={{xs: 12, md: 7}}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 4,
                                        border: '1px solid #e2e8f0',
                                        bgcolor: '#ffffff'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>
                                        Project Overview
                                    </Typography>
                                    <ProjectDetails project={projectData} onLocationUpdate={updateProjectLocation} />
                                </Paper>
                            </Grid>

                            {/* Right Side: Quick Actions */}
                            <Grid  size={{xs: 12, md: 5}} >

                                <Stack spacing={3}>
                                    <ActionCard
                                        title="Keyword Analysis"
                                        subtitle="Track search rankings and performance"
                                        count={projectData.keywords_count}
                                        to={`/projects/${projectData.id}/keywords`}
                                        icon={<QueryStatsIcon sx={{ fontSize: 32 }} />}
                                        color="#3b82f6"
                                    />

                                    <ActionCard
                                        title="Backlinks Monitoring"
                                        subtitle="Audit indexing and link health"
                                        count={projectData.backlinks_count}
                                        to={`/projects/${projectData.id}/links/backlinks`}
                                        icon={<MonitorHeartIcon sx={{ fontSize: 32 }} />}
                                        color="#8b5cf6"
                                    />

                                    <ActionCard
                                        title="Citations Monitoring"
                                        subtitle="Audit indexing and link health"
                                        count={projectData.citations_count}
                                        to={`/projects/${projectData.id}/links/citations`}
                                        icon={<LinkIcon sx={{ fontSize: 32 }} />}
                                        color="#8b5cf6"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </>
                )}
            </DataStateHandler>
        </Box>
    );
}

/** * Sub-component for the Action Cards
 */
function ActionCard({ title, subtitle, count, to, icon, color }: any) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                    borderColor: color,
                }
            }}
        >
            <CardActionArea component={RouterLink} to={to} sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: `${color}15`,
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {subtitle}
                        </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={1}>
                        <Badge
                            badgeContent={count}
                            color="primary"
                            max={999}
                            sx={{ '& .MuiBadge-badge': { fontWeight: 700, position: 'static', transform: 'none' } }}
                        />
                        <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                    </Stack>
                </Stack>
            </CardActionArea>
        </Paper>
    );
}