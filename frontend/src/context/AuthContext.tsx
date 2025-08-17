import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import userService from '../services/userService';

// AuthContext.tsx
interface AuthContextType {
    user: any;
    token: string | null;
    loading: boolean;
    login: (user: any, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const login = (userData: any, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        userService.loginUser(userData, authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        userService.logoutUser();
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch {
                logout(); // corrupted user object
            }
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);