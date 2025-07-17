import axios from '../axios';

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

type User = {
    id: number;
    name: string;
};



async function ensureCsrfCookie() {
    await axios.get(`${API}/sanctum/csrf-cookie`);
}
const userService = {
    async getUser() {
        await ensureCsrfCookie();

        const response = await axios.get<User>(`${API}/api/user`, { withCredentials: true,});
        return response.data;
    },

};

export default userService