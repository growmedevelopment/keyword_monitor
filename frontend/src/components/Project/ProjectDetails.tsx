import {Paper, Typography, Grid, Box, Link,Stack} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LaunchIcon from '@mui/icons-material/Launch';
import type {Project, ProjectLocationUpdate} from "../types/projectTypes";
import {useState} from "react";
import UpdateLocationDialog from "../Dialogs/ProjectDialog/UpdateProjectLocationDialog.tsx";

interface ProjectDetailsProps {
    project: Project;
    onLocationUpdate: (data: ProjectLocationUpdate) => void;
}

export default function ProjectDetails({ project, onLocationUpdate }: ProjectDetailsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleUpdateAndClose = (data: { country: string; location_code: number; location_name: string }) => {
        onLocationUpdate(data);
        setIsDialogOpen(false);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'transparent'
            }}
        >
            <Grid container spacing={0.5}>
                {/* Website Item */}
                <DetailItem
                    icon={<LanguageIcon fontSize="small" />}
                    label="Website"
                    value={
                        <Link
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                textDecoration: 'none',
                                fontWeight: 600,
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            {project.url.replace(/^https?:\/\//, '')}
                            <LaunchIcon sx={{ fontSize: 12 }} />
                        </Link>
                    }
                />

                {/* Country Item */}
                <DetailItem
                    icon={<PublicIcon fontSize="small" />}
                    label="Country Code"
                    value={project.country}
                />

                {/* Location Item */}
                <DetailItem
                    icon={<LocationOnIcon fontSize="small" />}
                    label="Target Location"
                    value={project.location_name}
                    onEdit={() => setIsDialogOpen(true)}
                />

                {/* Date Item */}
                <DetailItem
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label="Date Created"
                    value={new Date(project.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                />
            </Grid>

            <UpdateLocationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onUpdate={handleUpdateAndClose}
            />
        </Paper>
    );
}


/**
 * Helper Sub-component for Grid Items
 */
function DetailItem({ icon, label, onEdit, value }: { icon: React.ReactNode, label: string, value: React.ReactNode, onEdit?: () => void }) {
    return (
        <Grid size={{xs: 12}} >
            <Box sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: '#f8fafc' }
            }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>
                        {icon}
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            color: 'text.secondary'
                        }}
                    >
                        {label}
                    </Typography>

                    {onEdit && (
                        <Typography
                            onClick={onEdit}
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white'
                                }
                            }}
                        >
                            Edit
                        </Typography>
                    )}
                </Stack>
                <Box sx={{ pl: 3.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {value}
                    </Typography>
                </Box>


            </Box>
        </Grid>
    );
}

