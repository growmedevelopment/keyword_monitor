import axios from '../axios';



type User = {
    id: number;
    name: string;
};


const userService = {
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