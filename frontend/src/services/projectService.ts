import axios from '../axios';

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

type Project = {
    id: number;
    name: string;
    domain: string;
    created_at: string;
};


async function ensureCsrfCookie() {
    await axios.get(`${API}/sanctum/csrf-cookie`);
}
const projectService = {

    async getAll() {
        const response = await axios.get<Project[]>(`${API}/api/projects`);
        return response.data;
    },

    async getById(id: string) {
        const response = await axios.get(`${API}/api/projects/${id}` );
        return response.data;
    },

    async create(data: any) {
        await ensureCsrfCookie();
        const response = await axios.post(`${API}/api/projects`, data );
        return response.data;
    },

    async update(id: number | string, data: any) {
        await ensureCsrfCookie();
        const response = await axios.put(`${API}/api/projects/${id}`, data);
        return response.data;
    },

    async delete(id: number | string) {
        await ensureCsrfCookie();
        const response = await axios.delete(`${API}/api/projects/${id}`);
        return response.data;
    },
};

export default projectService