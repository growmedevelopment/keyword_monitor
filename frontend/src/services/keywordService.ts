import axios from '../axios';
import type {Keyword} from "../components/types/keywordTypes.ts";

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

type DeleteResponse = {
    status : string,
    message: string,
};

export type SeoMetricsResponse = {
    average_position: number;
    chart_data: {
        date: string;
        avg_position: number;
    }[];
};

const keywordService = {
    async create(projectId: string, keyword: string, groupId: number | null): Promise<any> {
        const response = await axios.post(`${API}/api/projects/${projectId}/keywords/create`, {
            keyword,
            keyword_group_id: groupId
        });

        return response.data;
    },

    async getById(id: string): Promise<Keyword> {
        const response = await axios.get(`${API}/api/keywords/${id}`);
        return response.data;
    },

    async deleteFromProject(keywordId: number): Promise<DeleteResponse> {
        const response = await axios.delete(`${API}/api/keywords/${keywordId}`);
        return response.data;
    },

    async getSeoMetrics(projectId: string, startDate: string, endDate: string): Promise<SeoMetricsResponse> {
        const payload = {
            start_date: startDate,
            end_date: endDate,
        };
        const response = await axios.post(
            `${API}/api/projects/${projectId}/keywords/seo-metrics`,
            payload
        );
        return response.data;
    },
};

export default keywordService;