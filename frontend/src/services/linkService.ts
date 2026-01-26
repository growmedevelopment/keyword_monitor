import axios from "../axios";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

// 1. Extract History into its own interface for cleanliness
export interface LinkHistoryItem {
    http_code: number | null;
    indexed: boolean;
    title: string | null;
    checked_at: string;
}

export interface LinkItem {
    id: number;
    url: string;
    type: string;
    is_checking: boolean;

    latest_result: {
        http_code: number | null;
        indexed: boolean | null;
        title: string | null;
        checked_at: string | null;
    };

    history: LinkHistoryItem[];
}

// 2. Updated to match the new Laravel Controller response
export type CreateResponseType = {
    message: string;
    data: {
        added_count: number;
        skipped_count: number;
        added_urls: LinkItem[];
        skipped_urls: string[];
    };
};

export type DeleteResponseType = {
    status: string;
    message: string;
}

export default {
    async getAll(projectId: string): Promise<LinkItem[]> {
        const res = await axios.get<LinkItem[]>(`${API}/api/projects/${projectId}/links`);
        return res.data;
    },

    async getLinksByType(type: 'backlinks' | 'citations', projectId: string): Promise<LinkItem[]> {
        const res = await axios.get<LinkItem[]>(`${API}/api/projects/${projectId}/links/${type}`);
        return res.data;
    },

    async create(projectId: string, urls: string[], type: 'backlinks' | 'citations'): Promise<CreateResponseType> {
        const res = await axios.post<CreateResponseType>(`${API}/api/projects/${projectId}/links`, {
            urls,
            type,
        });

        return res.data;
    },

    async delete(backlinkId: number, projectId: string): Promise<DeleteResponseType> {
        const res = await axios.delete<DeleteResponseType>(`${API}/api/projects/${projectId}/links/${backlinkId}`);
        return res.data;
    },

    async reCheckAllLinks(projectId: string, type: 'backlinks' | 'citations'): Promise<void> {
        const res = await axios.post(`${API}/api/projects/${projectId}/links/recheck-all`, {
            type
        });
        return res.data;
    },
};