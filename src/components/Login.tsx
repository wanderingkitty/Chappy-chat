import { useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setMessage('');
            
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен
                localStorage.setItem('token', data.jwt);
                setMessage('Успешный вход!');
                navigate('/home');  // Перенаправление после успешного входа
            } else {
                setMessage(data.message || 'Ошибка входа');
            }

        } catch (error) {
            console.error('Login error:', error);
            setMessage('Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>LOG IN</h2>
            <div>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
            </div>
            <button 
                className="login-btn"
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'LOG IN'}
            </button>
            {message && (
                <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default Login;