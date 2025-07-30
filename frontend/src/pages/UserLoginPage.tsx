import { useState } from 'react';
import axios from '../axios';
import {useAuth} from "../context/AuthContext.tsx";

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

export default function UserLoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Get CSRF cookie
            await axios.get(`${API}/sanctum/csrf-cookie`);

            // Attempt login
            await axios.post(`${API}/api/login`, form,
                {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    }
                }
            ).then(response => {

                const token = response.data.token;
                const user = response.data.user;

                login(user, token);

                //redirect
                // window.location.href = '/';
            });


        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}