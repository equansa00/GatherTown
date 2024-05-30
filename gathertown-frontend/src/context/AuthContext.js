// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register as registerService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const loginUser = async (userData) => {
        try {
            const response = await loginService(userData);
            if (response && response.token) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                navigate('/');
            } else {
                throw new Error('Login failed. User not found or password incorrect.');
            }
        } catch (error) {
            console.error('Login error:', error.message);
            throw error; // This will be caught in the login component and can display an appropriate message
        }
    };

    const registerUser = async (userData) => {
        try {
            const response = await registerService(userData);
            if (response && response.token) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                navigate('/');
            } else {
                throw new Error('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error.message);
            throw error;
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                logout();
            }
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, setUser, loginUser, registerUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);