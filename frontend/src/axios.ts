import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BACKEND_ENDPOINT;
axios.defaults.headers.common['Accept'] = 'application/json';