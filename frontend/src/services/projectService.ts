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


const projectService = {
    async getAll() {
        const response = await axios.get<Project[]>(`${API}/api/projects`, { headers });
        return response.data;
    },
    async getById(id: number | string) {
        const response = await axios.get(`${API}/api/projects/${id}`, { headers });
        return response.data;
    },
    async create(data: any) {
        const response = await axios.post(`${API}/api/projects`, data, { headers });
        return response.data;
    },
    async update(id: number | string, data: any) {
        const response = await axios.put(`${API}/api/projects/${id}`, data, { headers });
        return response.data;
    },
    async delete(id: number | string) {
        const response = await axios.delete(`${API}/api/projects/${id}`, { headers });
        return response.data;
    },
};

export default projectService