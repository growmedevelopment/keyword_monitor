import { startTransition, Suspense, useEffect, useOptimistic, useState } from 'react';
import { Button, Stack } from '@mui/material';
import projectService from '../services/projectService';
import CreateProjectDialog from '../components/Dialogs/ProjectDialog/CreateProjectDialog';
import type { Project } from '../components/types/projectTypes';
import ProjectsTable from "../components/Tables/ProjectsTable/ProjectsTable.tsx";
import toast from "react-hot-toast";


export default function ProjectsPage() {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [realProjects, setRealProjects] = useState<Project[]>([]);

    useEffect(() => {
        projectService
            .getAll()
            .then(setRealProjects)
            .catch((err) => {
                toast.error(err.response.data.message || "Failed to fetch projects.");
            });
    }, []);

    const [optimisticProjects, addOptimisticProject] = useOptimistic<Project[], Project>(
        realProjects,
        (prevProjects, newProject) => [...prevProjects, newProject]
    );

    const handleDialog = () => setDialogOpen((prev) => !prev);

    const handleCreate = async (data: Project) => {
        const optimisticProject: Project = { ...data };

        startTransition(() => {
            addOptimisticProject(optimisticProject);
        });

        setDialogOpen(false);

        try {
            const createdProject = await projectService.create(data);
            setRealProjects((prev) => [...prev, createdProject]);
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to create project.");
        }
    };

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Stack spacing={2}>
                <ProjectsTable projects={optimisticProjects}/>

                <Button variant="contained" onClick={handleDialog}>
                    Create New Project
                </Button>

                {dialogOpen && (
                    <CreateProjectDialog
                        isOpen={dialogOpen}
                        onClose={handleDialog}
                        onCreate={handleCreate}
                    />
                )}
            </Stack>
        </Suspense>
    );
}