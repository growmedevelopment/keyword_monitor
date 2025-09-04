import axios from '../axios';
import type {Dashboard} from "../components/types/dashboardTypes.ts";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;



const dashboardService = {
    async getGeneralData():Promise<Dashboard> {
        const response = await axios.get(`${API}/api/dashboard` );
        return response.data;
    },
};

export default dashboardService;