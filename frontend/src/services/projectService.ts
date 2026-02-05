import axios from '../axios';
import type {Project, ProjectLocationUpdate} from "../components/types/projectTypes.ts";
import type {Dayjs} from "dayjs";
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

    async getProjectName(id: string) {
        const response = await axios.get<{project_name: string}>(`${API}/api/projects/${id}/name`);
        return response.data.project_name;
    },

    async getById(id: string) {
        const response = await axios.get<Project>(`${API}/api/projects/${id}`);
        return response.data;
    },

    async getDetailedById(id: string, dateRange: [Dayjs, Dayjs], mode: "range" | "compare") {

        const [start, end] = dateRange;

        const startDate = start.format("YYYY-MM-DD");
        const endDate = end.format("YYYY-MM-DD");

        const response = await axios.get<Project>(`${API}/api/projects/${id}/detailed`,{
            params: {
                mode,
                start_date: startDate,
                end_date: endDate,
            },
        });
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

    async restore (id: number) {
        const response = await axios.patch(`${API}/api/projects/${id}/restore`);
        return response.data;
    },

    async updateLocation(id: number, newLocation: ProjectLocationUpdate) {
        const response = await axios.patch(`${API}/api/projects/${id}/location`, newLocation);
        return response.data;
    }
};

export default projectService