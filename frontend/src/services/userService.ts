import axios from '../axios';
import type {UserAPIDetailsType} from "../components/types/userAPIDetailsType.ts";
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT

type User = {
    id: number;
    name: string;
};

const userService = {
    async fetchUserAPIData() {
        const response = await axios.get<UserAPIDetailsType>(`${API}/api/user/api-data`);
        return response.data;
    },

    loginUser: (user: User, token: string) => {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    logoutUser: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    },
};

export default userService