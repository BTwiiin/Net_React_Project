import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { RegisterModel } from '../../viewmodels/viewmodels';
import { API_URL } from '../../constants/consts';
import { FiUser, FiLock } from 'react-icons/fi';
import Logo from "../../assets/workshop.webp"; 
import "./login.css"; 

const RegisterPage = observer(() => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== repeatPassword) {
            setError('Passwords do not match');
            return;
        }
        await submit();
    };

    const submit = async () => {
        try {
            const formData: RegisterModel = {
                Username: username,
                Password: password
            };
            const response = await fetch(`${API_URL}/account/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Registration successful, navigating to login');
                navigate('/login');
            } else {
                console.log('Registration not successful');
                setError(data.Message);
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred');
        }
    };

    return (
        <div className="screen-1">
            <img src={Logo} alt="Logo" className="logo" />
            <form onSubmit={handleSubmit}>
                <div className="email">
                    <label htmlFor="username">Username</label>
                    <div className="sec-2">
                        <FiUser />
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <div className="password">
                    <label htmlFor="password">Password</label>
                    <div className="sec-2">
                        <FiLock />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="············"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="password">
                    <label htmlFor="repeatPassword">Repeat Password</label>
                    <div className="sec-2">
                        <FiLock />
                        <input
                            id="repeatPassword"
                            name="repeatPassword"
                            type="password"
                            required
                            placeholder="············"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button className="login" type="submit">
                    Register
                </button>

                <div className="footer">
                    <span onClick={() => navigate('/login')}>Login</span>
                </div>

                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
});

export default RegisterPage;
