import axios from '../axios';
import type {Keyword} from "../components/types/keywordTypes.ts";
import type {Dayjs} from "dayjs";

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

type DeleteResponse = {
    status : string,
    message: string,
};

export interface KeywordCreateResponse {
    message: string;
    data: {
        added_count: number;
        skipped_count: number;
        added_keywords: Keyword[];
        skipped_keywords: string[];
    };
}


const keywordService = {
    async create(projectId: string, keywords: string[], groupId: number[] | null): Promise<KeywordCreateResponse> {
        const response = await axios.post(`${API}/api/projects/${projectId}/keywords/create`, {
            keywords,
            keyword_groups: groupId
        });

        return response.data;
    },

    async getById(id: string): Promise<Keyword> {
        const response = await axios.get(`${API}/api/keywords/${id}`);
        return response.data;
    },


    async getByFilteredResults(keywordId: string, dateRange: [Dayjs, Dayjs], mode: "range" | "compare" | "latest"): Promise<Keyword> {
        const [start, end] = dateRange;

        const startDate = start.format("YYYY-MM-DD");
        const endDate = end.format("YYYY-MM-DD");
        const response = await axios.post(`${API}/api/keywords/${keywordId}/filteredResults`, {
            mode,
            date_range: {
                start_date: startDate,
                end_date: endDate
            }
        });
        return response.data;
    },


    async getAssignedGroups(keywordId: string): Promise<number[]> {
        const response = await axios.get(`${API}/api/keywords/${keywordId}/groups/assigned`);
        return response.data; // Expected: [1, 2, 3]
    },

    async deleteFromProject(keywordId: number): Promise<DeleteResponse> {
        const response = await axios.delete(`${API}/api/keywords/${keywordId}`);
        return response.data;
    },
};

export default keywordService;