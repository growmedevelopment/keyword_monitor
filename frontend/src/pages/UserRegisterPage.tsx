import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BACKEND_ENDPOINT;

export default function UserRegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.get(`${API}/sanctum/csrf-cookie`, { withCredentials: true });
            await axios.post(`${API}/api/register`, form, { withCredentials: true });
            setSuccess('Registration successful!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} value={form.name} required />
            <input name="email" placeholder="Email" type="email" onChange={handleChange} value={form.email} required />
            <input name="password" placeholder="Password" type="password" onChange={handleChange} value={form.password} required />
            <input name="password_confirmation" placeholder="Confirm Password" type="password" onChange={handleChange} value={form.password_confirmation} required />
            <button type="submit">Register</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
    );
}