import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BACKEND_ENDPOINT;
axios.defaults.headers.common['Accept'] = 'application/json';

// Inject CSRF token from cookie into every request
axios.interceptors.request.use((config) => {
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // const token = localStorage.getItem('token');
    // if (token) {
    //     config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axios;