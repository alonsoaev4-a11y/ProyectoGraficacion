import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSimulatedAuth = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ email: string; name: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('herman_auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
                setUser(parsed.user);
            }
        }
    }, []);

    const login = (email: string) => {
        const userData = { email, name: email.split('@')[0] };
        localStorage.setItem('herman_auth', JSON.stringify({
            isAuth: true,
            user: userData
        }));
        setUser(userData);
        setTimeout(() => navigate('/dashboard'), 1500);
    };

    const logout = () => {
        localStorage.removeItem('herman_auth');
        setUser(null);
        navigate('/');
    };

    const isAuthenticated = () => {
        return !!localStorage.getItem('herman_auth');
    };

    return { login, logout, isAuthenticated, user };
};
