import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./StartPage.css";
import {  jwtDecode } from "jwt-decode";


interface User {
    name: string;
    userId: string;
}

interface JwtPayload {
    name: string;
    userId: string;
    [key: string]: any;
}

const StartPage = () => {
    const navigate = useNavigate();

    const handleChannelClick = (channelType: string) => {
        navigate(`/home?channel=${channelType}`);
    };

    const handleNavigationClick = (path: string) => {
        navigate(path);
        
    };
 const [user, setUser] = useState<User | null>(null);

 const handleLogUt = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null)
    navigate('/');
};

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const userData = jwtDecode<JwtPayload>(token);
                setUser({
                    name: userData.name,
                    userId: userData.userId,
                });
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem("token");
            }
        }
    }, []);

    return (
        <div className="start-page">
                 <h1 className="user-header-main-page">
                Logged in as:{" "}
                <span className="username">{user ? user.name : "Guest"}</span>
                {user ? (
                    <button className="logout-btn" onClick={handleLogUt}>LOG OUT</button>
                ) : (
                    <button className="logout-btn disabled" disabled>LOG OUT</button>
                )}
            </h1>
            
            <div className="options-container">
                <div className="left-options">
                    <div
                        className="option-item"
                        onClick={() => handleChannelClick("CODING")}
                    >
                        <div className="option-icon">
                            <svg viewBox="0 0 24 24" className="gear-icon">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                        </div>
                        <div className="option-line"></div>
                        <span>CODING</span>
                    </div>
                    <div
                        className="option-item"
                        onClick={() => handleChannelClick("STACK")}
                    >
                        <div className="option-icon">
                            <svg viewBox="0 0 24 24" className="gear-icon">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                            </svg>
                        </div>
                        <div className="option-line"></div>
                        <span>STACK OVERFLOW & CHILL</span>
                    </div>
                </div>

                <div className="center-logo">
                    <img src="/90156689.png" alt="Logo" className="main-logo move-logo" />
                </div>

                <div className="right-options">
                    <div
                        className="option-item"
                        onClick={() => handleNavigationClick("/login")}
                    >
                        <span>LOG IN</span>
                        <div className="option-line"></div>
                        <div className="option-icon lock">
                            <svg viewBox="0 0 24 24" className="lock-icon">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                    </div>
                <div
                    className="option-item"
                    onClick={() => handleNavigationClick("/private-messages")}
                >
                    <span>PRIVATE MESSAGES</span>
                    <div className="option-line"></div>
                    <div className="option-icon message">
                        <svg viewBox="0 0 24 24" className="message-icon">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                </div>
        </div>
            </div>
        </div>
    );
};

export default StartPage;
