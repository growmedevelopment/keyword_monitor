
import {List, ListItem, ListItemText, Paper} from "@mui/material";

interface Project {
    id: number;
    name: string;
    url: string;
}

export default function ProjectList({projects}: {projects: Project[] }
) {

    return (
        <Paper elevation={2} sx={{ padding: 2 }}>
            <List>
                {projects.map((project) => (
                    <ListItem key={project.id} divider>
                        <ListItemText primary={project.name} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}