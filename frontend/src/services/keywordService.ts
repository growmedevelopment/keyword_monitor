import axios from '../axios';
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

const keywordService = {
    async create(projectId: string, keyword: string): Promise<any> {
        const response = await axios.post(`${API}/api/projects/${projectId}/keywords`, { keyword });
        return response.data;
    },
};

export default keywordService;