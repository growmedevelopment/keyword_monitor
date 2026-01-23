import axios from '../axios';
const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;


type PendingTasksResponse = {
    pending_count: number,
    has_pending: boolean
}


const adminService = {

    checkPendingTasks: async () => {
        const response = await axios.get<PendingTasksResponse>(`${API}/api/admin/check-pending-tasks`);
        return response.data;
    },

    updateCreatedTasks: async () => {
        return axios.post(`${API}/api/admin/update-created-tasks`);
    }

};

export default adminService;