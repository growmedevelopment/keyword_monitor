import axios from '../axios';
import type {Project} from "../components/types/projectTypes.ts";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

async function ensureCsrfCookie() {
    await axios.get(`${API}/sanctum/csrf-cookie`);
}
const projectService = {

    async getAll() {
        const response = await axios.get<Project[]>(`${API}/api/projects`);
        return response.data;
    },

    async getArchived() {
        const response = await axios.get<Project[]>(`${API}/api/projects/archived`);
        return response.data;
    },

    async getById(id: string) {
        const response = await axios.get<Project>(`${API}/api/projects/${id}` );
        return response.data;
    },

    async create(data: Project) {
        await ensureCsrfCookie();
        const response = await axios.post(`${API}/api/projects`, data );
        return response.data;
    },

    async delete(id: number) {
        await ensureCsrfCookie();
        const response = await axios.delete(`${API}/api/projects/${id}`);
        return response.data;
    },
};

export default projectService