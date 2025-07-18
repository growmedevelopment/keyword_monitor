import {startTransition, Suspense, use, useEffect, useOptimistic, useState} from 'react';
import { Button, Stack, Alert } from '@mui/material';
import projectService from '../services/projectService';
import CreateProjectDialog from '../components/ProjectDialog/CreateProjectDialog.tsx';
import ProjectList from "../components/ProjectList.tsx";


export default function ProjectsPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [errors, setErrors] = useState<{message: string, errors:{} }>({});

    const [realProjects, setRealProjects] = useState([]);
    useEffect(() => {
        projectService.getAll().then(setRealProjects).catch((err) => {
            console.error('Failed to fetch projects', err);
        });
    }, []);
    const [optimisticProjects, addOptimisticProject] = useOptimistic(
        realProjects,
        (prevProjects, newProject) => [...prevProjects, newProject]
    );

    const handleDialog = () => setDialogOpen(prev => !prev);

    const handleCreate = async (data: any) => {
        const tempId = Date.now(); // temp ID
        const optimisticProject = { id: tempId, ...data };

        startTransition(() => {
            addOptimisticProject(optimisticProject);
        });
        setDialogOpen(false);

        try {
            const createdProject = await projectService.create(data);
            setRealProjects(prev => [...prev, createdProject]);
        } catch (error:any) {
            setErrors(error.response.data)
        }
    };

    return (
        <Suspense fallback={<p>Loading...</p>}>

            <Stack spacing={2}>
                <ProjectList projects={optimisticProjects} />

                <Button variant="contained" onClick={handleDialog}>
                    Create New Project
                </Button>

                {errors.message &&  <Alert severity="warning">
                    {errors.message}
                </Alert>}

                {dialogOpen && <CreateProjectDialog
                  isOpen={dialogOpen}
                  onClose={handleDialog}
                  onCreate={handleCreate}
                />}

            </Stack>
        </Suspense>
    );
}