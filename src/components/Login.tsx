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
            
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.jwt;
                localStorage.setItem('token', data.jwt);
                console.log("Stored token for legolas_elf:", token);
                setMessage('Login success!');
                navigate('/'); 
            } else {
                setMessage(data.message || 'Error log in');
            }

        } catch (error) {
            console.error('Login error:', error);
            setMessage('Error connecting to the server');
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