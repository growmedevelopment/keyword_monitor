import axios from "../axios";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

export interface LinkItem {
    id: number;
    url: string;
    is_checking: boolean;

    latest_result: {
        http_code: number | null;
        indexed: boolean | null;
        title: string | null;
        checked_at: string | null;
    };

    history: {
        http_code: number | null;
        indexed: boolean;
        title: string | null;
        checked_at: string;
    }[];
}

type CreateResponseType = {
    status: string;
    message: string;
};

type DeleteResponseType = {
    status: string;
    message: string;
}

export default {
    async getAll(projectId: string): Promise<LinkItem[] > {
        const res = await axios.get(`${API}/api/projects/${projectId}/links`);
        return res.data;
    },

    async getLinksByType(type: 'backlinks' | 'citations', projectId: string): Promise<LinkItem[] > {
        const res = await axios.get(`${API}/api/projects/${projectId}/links/${type}`);
        return res.data;
    },

    async create(projectId: string, urls: string[], type: 'backlinks' | 'citations'): Promise<CreateResponseType> {
        const res = await axios.post(`${API}/api/projects/${projectId}/links`, {
            urls,
            type,
        });

        return res.data;
    },

    async delete(backlinkId: number): Promise<DeleteResponseType> {
        const res = await axios.delete(`${API}/api/projects/links/${backlinkId}`);
        return res.data;
    },
};