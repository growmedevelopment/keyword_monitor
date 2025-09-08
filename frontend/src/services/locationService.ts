import axios from '../axios';
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

const locationService = {
    async getCountries(): Promise<any> {
        const response = await axios.post(`${API}/api/serp/locations/`, {
            request_type: 'country',
            location_type: 'country',
        });
        return response.data;
    },

    async getCities(country_iso_code: string): Promise<any> {
        const response = await axios.post(`${API}/api/serp/locations/`, {
            request_type: 'cities',
            location_type: 'cities',
            country_iso_code,
        });
        return response.data;
    },
};

export default locationService;