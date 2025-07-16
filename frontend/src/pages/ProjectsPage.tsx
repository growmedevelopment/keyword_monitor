import { use, Suspense } from 'react';
import projectService from '../services/projectService'



const projectPromise = projectService.getAll();

function ProjectList() {
    const projects = use(projectPromise);
    return (
        <ul>
            {projects.map((project) => (
                <li key={project.id}>{project.name}</li>
            ))}
        </ul>
    );
}

export default function ProjectsPage() {

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ProjectList />
        </Suspense>
    );
}