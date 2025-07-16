import axios from 'axios'

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

type Project = {
    id: number;
    name: string;
    domain: string;
    created_at: string;
};

const headers = {
    Accept: 'application/json',
    //todo add authorization
    //Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
};

async function ensureCsrfCookie() {
    await axios.get(`${API}/sanctum/csrf-cookie`, { withCredentials: true });
}
const projectService = {

    async getAll() {
        await ensureCsrfCookie();
        const response = await axios.get<Project[]>(`${API}/api/projects`, { headers,  withCredentials: true,});
        return response.data;
    },
    async getById(id: number | string) {
        const response = await axios.get(`${API}/api/projects/${id}`, { headers,  withCredentials: true,});
        return response.data;
    },
    async create(data: any) {
        await ensureCsrfCookie();
        const response = await axios.post(`${API}/api/projects`, data, { headers,  withCredentials: true,});
        return response.data;
    },
    async update(id: number | string, data: any) {
        await ensureCsrfCookie();
        const response = await axios.put(`${API}/api/projects/${id}`, data, { headers,  withCredentials: true,});
        return response.data;
    },
    async delete(id: number | string) {
        await ensureCsrfCookie();
        const response = await axios.delete(`${API}/api/projects/${id}`, { headers,  withCredentials: true,});
        return response.data;
    },
};

export default projectService