import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
    const { registerUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }
        try {
            const response = await registerUser(formData);
            console.log('Registration successful', response);
            // Clear form and errors
            setErrors({});
            setFormData({
                email: '',
                username: '',
                firstName: '',
                lastName: '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Registration failed', error);
            if (error.response && error.response.data) {
                setErrors({ global: error.response.data.msg });
            } else {
                setErrors({ global: "Unexpected error occurred. Please try again." });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
            {errors.global && <p className="error">{errors.global}</p>}
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;
