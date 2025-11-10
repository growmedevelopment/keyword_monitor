import { Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { Project } from "../types/projectTypes";

interface ProjectDetailsProps {
    project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
    return (
        <Paper sx={{ mb: 3}}>
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
        </Paper>
    );
}