import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Signup.css'

const SignUp = () => {
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();

		if (password.length < 8) {
			setMessage('Password must be at least 8 characters long');
			return;
		}
	
		if (password.length > 100) {
			setMessage('Password must be less than 100 characters');
			return;
		}
	
		if (!/^[a-zA-Z0-9]+$/.test(password)) {
			setMessage('Password must contain only letters and numbers');
			return;
		}

        try {
            setIsRegistering(true);
            setMessage('');

            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Registration failed');
                return;
            }

            if (data.jwt) {
                localStorage.setItem('token', data.jwt);
                navigate('/');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('Failed to register. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleRegisterUser}>
			<div className="input-group">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Username"
                        required
                        minLength={3}
                        maxLength={30}
                    />
                    <span className="input-hint">Username must be 3-30 characters long</span>
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <span className="input-hint">Password must be 8-100 characters long, containing only letters and numbers</span>
                </div>
                {message && <div className="message error">{message}</div>}
                <button 
                    type="submit" 
                    className="signup-btn"
                    disabled={isRegistering}
                >
                    {isRegistering ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
            <div className="login-link">
                Already have an account?
                <button onClick={() => navigate('/login')}>
                    Login here
                </button>
            </div>
        </div>
    );
};

export default SignUp;