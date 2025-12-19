import axios from "../axios";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

export interface BacklinkItem {
    id: number;
    url: string;

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
    async getAll(projectId: string): Promise<{ backlinks: BacklinkItem[] }> {
        const res = await axios.get(`${API}/api/projects/${projectId}/backlinks`);
        return res.data;
    },

    async create(projectId: string, urls: string[]): Promise<CreateResponseType> {
        const res = await axios.post(`${API}/api/projects/${projectId}/backlinks`, {
            urls
        });

        return res.data;
    },

    async delete(backlinkId: number): Promise<DeleteResponseType> {
        const res = await axios.delete(`${API}/api/projects/backlinks/${backlinkId}`);
        return res.data;
    },
};