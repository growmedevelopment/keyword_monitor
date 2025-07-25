import { startTransition, Suspense, useEffect, useOptimistic, useState } from 'react';
import { Button, Stack, Alert } from '@mui/material';
import projectService from '../services/projectService';
import CreateProjectDialog from '../components/Dialogs/ProjectDialog/CreateProjectDialog';
import type { Project } from '../components/types/projectTypes';
import ProjectsTable from "../components/Tables/ProjectsTable/ProjectsTable.tsx";

interface ProjectError {
    message: string;
    errors: Record<string, string[]>;
}

export default function ProjectsPage() {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [errors, setErrors] = useState<ProjectError>({ message: '', errors: {} });

    const [realProjects, setRealProjects] = useState<Project[]>([]);

    useEffect(() => {
        projectService
            .getAll()
            .then(setRealProjects)
            .catch((err) => {
                console.error('Failed to fetch projects', err);
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
            setErrors(error?.response?.data || { message: 'Unknown error', errors: {} });
        }
    };

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Stack spacing={2}>
                <ProjectsTable projects={optimisticProjects}/>

                <Button variant="contained" onClick={handleDialog}>
                    Create New Project
                </Button>

                {!!errors.message && (
                    <Alert severity="warning">{errors.message}</Alert>
                )}

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