import axios from '../axios';
import type {Keyword} from "../components/types/keywordTypes.ts";
import type {Dayjs} from "dayjs";

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


    async getByFilteredResults(keywordId: string, dateRange: [Dayjs, Dayjs], mode: "range" | "compare"): Promise<Keyword> {
        const [start, end] = dateRange;

        const startDate = start.format("YYYY-MM-DD");
        const endDate = end.format("YYYY-MM-DD");
        const response2 = await axios.get(`${API}/api/keywords/${keywordId}`);
        const response = await axios.post(`${API}/api/keywords/${keywordId}/filteredResults`, {
            mode,
            date_range: {
                start_date: startDate,
                end_date: endDate
            }
        });

        console.log(response2.data,'response2');
        console.log(response.data,'response');
        return response.data;
    },



    async deleteFromProject(keywordId: number): Promise<DeleteResponse> {
        const response = await axios.delete(`${API}/api/keywords/${keywordId}`);
        return response.data;
    },

    // async getSeoMetrics(id: string, startDate: string, endDate: string, mode: string): Promise<SeoMetricsResponse> {
    //     const payload = {
    //         start_date: startDate,
    //         end_date: endDate,
    //         mode,
    //     };
    //     const response = await axios.post(`${API}/api/seo-metrics/${id}`, payload);
    //     return response.data;
    // },
};

export default keywordService;