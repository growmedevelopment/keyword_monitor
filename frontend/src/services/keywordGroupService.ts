import axios from '../axios';
import type {KeywordGroup} from "../components/types/keywordTypes.ts";

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

type DeleteResponse = {
    status : string,
    message: string,
};

const keywordGroupService = {
    async create({name, color, project_id}: {name: string, color: string, project_id: number}): Promise<any> {
        const response = await axios.post(`${API}/api/keyword-groups`, {name, color, project_id});
        return response.data;
    },

    async getByProject(project_id: number): Promise<KeywordGroup[]> {
        const response = await axios.get(`${API}/api/keyword-groups/project/${project_id}`);
        return response.data;
    },

    async getAll(): Promise<KeywordGroup[]> {
        const response = await axios.get(`${API}/api/keyword-groups`);
        return response.data;
    },

    async delete(id: number): Promise<DeleteResponse> {
        const response = await axios.delete(`${API}/api/keyword-groups/${id}`);
        return response.data;
    },
};

export default keywordGroupService;