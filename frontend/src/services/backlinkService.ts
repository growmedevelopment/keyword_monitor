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

export default {
    async getAll(projectId: string): Promise<{ backlinks: BacklinkItem[] }> {
        const res = await axios.get(`${API}/api/projects/${projectId}/backlinks`);
        return res.data;
    },

    // async checkStatus(projectId: string, backlinkId: number): Promise<any> {
    //     const res = await axios.get(`${API}/api/projects/${projectId}/backlinks/${backlinkId}/status`);
    //     return res.data;
    // },
    //
    // async checkIndexing(projectId: string, backlinkId: number): Promise<any> {
    //     const res = await axios.get(`${API}/api/projects/${projectId}/backlinks/${backlinkId}/indexing`);
    //     return res.data;
    // },
    //
    // async delete(projectId: string, backlinkId: number): Promise<any> {
    //     const res = await axios.delete(`${API}/api/projects/${projectId}/backlinks/${backlinkId}`);
    //     return res.data;
    // },

    async create(projectId: string, urls: string[]): Promise<{ backlinks: BacklinkItem[] }> {
        const res = await axios.post(`${API}/api/projects/${projectId}/backlinks`, {
            urls
        });

        return res.data;
    }
};