import axios from '../axios';
import type {Keyword} from "../components/types/keywordTypes.ts";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

const keywordService = {
    async create(projectId: string, keyword: string): Promise<any> {
        const response = await axios.post(`${API}/api/projects/${projectId}/keywords/create`, { keyword });
        return response.data;
    },

    async getById(id: string):Promise<Keyword> {
        const response = await axios.get(`${API}/api/keywords/${id}` );
        return response.data;
    },
};

export default keywordService;