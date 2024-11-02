import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Home.css";

interface JwtPayload {
    _id: string;   
    name: string;
    userId: string;
    [key: string]: any;
}
interface User {
    _id: string;  
    name: string;
}

interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    content: string;
    createdAt: Date;
}

const PrivateMessages = () => {
    const [selectedChannelId, setSelectedChannelId] = useState<string>("");
    const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [usersList, setUsersList] = useState<User[]>([])

    useEffect(() => {
        const fetchUsers = async () => {

            try {
                const headers: HeadersInit = {};
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = token;
                }
                const response = await fetch("/api/users", { headers })
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setUsersList(data)
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchUsers();
    }, [user])

    useEffect(() => {
        const fetchChats = async () => {
            if (!user || user.name === 'Guest' || !user._id) {
                console.log("User is not valid, skipping chat fetch.");
                return; 
            }
            console.log("Fetching chats for user:", user.name);
    
            try {
                const headers: HeadersInit = {};
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = token;
                }
    
                const response = await fetch("/api/private-messages/chat", { headers });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log("Fetched chats:", data); // Log fetched chats
                setChats(data);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
    
        fetchChats();
    }, [user]);
    
    
    


    useEffect(() => {
        const fetchPrivateMessages = async () => {
            if (!selectedChannelId) return;

            try {
                const headers: HeadersInit = {};
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = token;
                }

                const response = await fetch(
                    `/api/private-messages/chat/${selectedChannelId}`,
                    {
                        headers,
                    }
                );
                if (response.status === 403) {
                    setPrivateMessages([]);
                    return;
                }
                const data = await response.json();
                setPrivateMessages(data);
            } catch (error) {
                console.error("Error fetching private messages:", error);
            }
        };

        fetchPrivateMessages();
    }, [selectedChannelId]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const userData = jwtDecode<JwtPayload>(token);
                console.log("Decoded user data:", userData); // Log the user data
    
                setUser({
                    _id: userData.userId || userData._id,  // Adjust here if necessary
                    name: userData.name,
                });
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem("token");
            }
        }
    }, []);
    

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChannelId) return;

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token") || ''
            };

            const currentChat = chats.find(chat => chat._id === selectedChannelId);
            if (!currentChat) return;

            const response = await fetch('/api/private-messages', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    content: newMessage,
                    recipientId: currentChat.participants.find((id: string | undefined) => id !== user?._id),
                    recipientName: currentChat.recipientName
                })
            });

            if (response.ok) {
          
                setNewMessage('');

                const updatedResponse = await fetch(`/api/private-messages/chat/${selectedChannelId}`, {
                    headers: { 'Authorization': localStorage.getItem("token") || '' }
                });
                const updatedMessages = await updatedResponse.json();
                setPrivateMessages(updatedMessages);
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    const handleUserSelect = async (selectedUser: User) => {
   
            try {
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token") || ''
                };
    
                const response = await fetch('/api/private-messages/chat', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        recipientId: selectedUser._id,
                        recipientName: selectedUser.name
                    })
                });
    
                if (response.ok) {
                    const newChatData = await response.json();
                    setSelectedChannelId(newChatData._id);
                    setChats(prevChats => [...prevChats, newChatData]);

                } else {
                    const errorData = await response.json();
                    console.error('Failed to create chat', errorData);
                }
            } catch (error) {
                console.error("Error creating chat and sending message:", error);
            }
        }
    
    

    return (
        <div className="home-container">
            <div className="channels-panel">
                <h1 className="user-header">
                    Logged in as:{" "}
                    <span className="username">{user ? user.name : "Guest"}</span>
                </h1>
                <div className="chats-section">
                    
                <div className="channels-list">
                    {chats.map((chat) => {
                        // Определяем, является ли текущий пользователь отправителем
                        const isSender = chat.participants[0] === user?._id;
                        // Выбираем имя собеседника в зависимости от роли пользователя
                        const chatName = isSender ? chat.recipientName : chat.senderName;
                        
                        return (
                            <div
                            key={chat._id}
                            onClick={() => setSelectedChannelId(chat._id)}
                            className={`channel-item ${selectedChannelId === chat._id ? "selected" : ""}`}
                            >
                                <span> Chat with {chatName || "Unknown"}</span>
                            </div>
                        );
                    })}
                    </div>
                </div>

                <div className="users-section">
                    <h3>Chappy-chat users:</h3>
                    <div className="users-list">

                        {usersList.map(user => (
                            <div
                            key={user._id}
                            className="user-item"
                            onClick={() => handleUserSelect(user)}
                            >
                                {user.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="messages-panel">
                <div className="messages-container">
                    <h2 className="messages-header">Messages</h2>
                    {!user || user.name === 'Guest' ? (
                        <div className="unauthorized-message">
                            Sorry, private messages are only for authorized users. Please, log in to start chatting.
                        </div>
                    ) : (
                        <>
                        </>
                    )}
                    {selectedChannelId && user && (
                        <div className="messages-list">
                            {privateMessages.map((message) => (
                                <div key={message._id}  className={`message-item ${message.senderId === user?._id ? 'message-own' : 'message-other'}`}
                                >
                                    <div className="message-header">
                                        <div className="sender-name">{message.senderName}</div>
                                        <div className="message-time">
                                            {new Date(message.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="message-content">{message.content}</div>
                                </div>
                            ))}
                            <div className="message-input-container">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="message-input"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="send-button"
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateMessages;