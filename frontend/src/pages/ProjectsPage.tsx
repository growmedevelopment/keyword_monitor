import { use, Suspense } from 'react';
import axios from 'axios';
const api = import.meta.env.VITE_API_BACKEND_ENDPOINT;

// Define the structure of your project data
type Project = {
    id: number;
    name: string;
    domain: string;
    created_at: string;
};


const projectPromise: Promise<Project[]> = axios
    .get<Project[]>(`${api}/api/projects`)
    .then((res) => res.data);


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