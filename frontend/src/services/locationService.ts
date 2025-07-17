import axios from '../axios';
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

const locationService = {
    async getAll() {
        const response = await axios.get(`${API}/serp/locations` );
        return response.data;
    },
};

export default locationService;