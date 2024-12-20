import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import leftArrow from '../assets/left-arrow.png'; 
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import { useUserStore } from "../stores/userStore";
import { User } from "../types/index";

interface JwtPayload {
    _id: string;   
    name: string;
    [key: string]: any;
}

interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    content: string;
    createdAt: Date;
}

interface Chat {
    _id: string;
    participants: string[];
    recipientName: string;
    senderName: string;
    lastMessage?: Message;
}

const PrivateMessages = () => {

    const { 
        currentUser, 
        usersList, 
        setCurrentUser, 
        setUsersList 
    } = useUserStore();


    const [selectedChannelId, setSelectedChannelId] = useState<string>("");
    const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    // const [usersList, setUsersList] = useState<User[]>([])
    const [newMessage, setNewMessage] = useState<string>("");


    const navigate = useNavigate()
    const handleGoBackBtn = () => {
      navigate( '/')
    }

    useEffect(() => {
        const messagesList = document.querySelector('.messages-list');
        if (messagesList) {
            messagesList.scrollTo({
                top: messagesList.scrollHeight,
            });
        }
    }, [privateMessages]);

    const sortChats = (chatsToSort: Chat[]) => {
        return chatsToSort.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });
    };
    
    const sortUsers = (users: User[]) => {
        return [...users].sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    };
    

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
                const sortedUsers = sortUsers(data as User[])
                setUsersList(sortedUsers)
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchUsers();
    }, [currentUser, setUsersList])

    useEffect(() => {
        const fetchChats = async () => {
            if (!user || user.name === 'Guest' || !user._id) {
                console.log("User is not valid, skipping chat fetch.");
                return;
            }
            
            try {
                const headers: HeadersInit = {};
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = token;
                }
        
                const response = await fetch("/api/private-messages/chat", { headers });
                if (!response.ok) {
                    throw new Error("Failed to fetch chats");
                }
                const data = await response.json();
        
                const chatsWithMessages = [];
        
                for (const chat of data) {
                    try {
                        const response = await fetch(
                            `/api/private-messages/chat/${chat._id}`,
                            { headers }
                        );
                        
                        if (!response.ok) {
                            console.warn(`Failed to fetch messages for chat ${chat._id}`);
                            chatsWithMessages.push({
                                ...chat,
                                lastMessage: null
                            });
                            continue;
                        }
        
                        const messages = await response.json();
                        
                        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                        
                        chatsWithMessages.push({
                            ...chat,
                            lastMessage
                        });
                    } catch (error) {
                        console.warn(`Error fetching messages for chat ${chat._id}:`, error);
                        chatsWithMessages.push({
                            ...chat,
                            lastMessage: null
                        });
                    }
                }
        
                const sortedChats = chatsWithMessages.sort((a, b) => {
                    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                    return timeB - timeA;
                });
        
                setChats(sortedChats);
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
                console.log("Decoded user data:", userData);
    
                setUser({
                    _id: userData._id,  
                    name: userData.name,
                    isGuest: false
                });
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem("token");
            }
        }
    }, [setCurrentUser]);
    

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
            const existingChat = chats.find(chat => 
                chat.participants.includes(selectedUser._id) && 
                chat.participants.includes(user?._id)
            );
    
            if (existingChat) {
                setSelectedChannelId(existingChat._id);
                return;
            }
    
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token") || ''
            };
    
            const response = await fetch('/api/private-chats/chat', {
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
                setChats(prevChats => sortChats([...prevChats, newChatData]));
            } else {
                const errorData = await response.json();
                console.error('Failed to create chat', errorData);
            }
        } catch (error) {
            console.error("Error creating chat and sending message:", error);
        }
    };
    

    return (
        <div className="home-container">
            <div className="channels-panel">
                <h1 className="user-header">
                <div className="arrow-btn">
                    <button onClick={handleGoBackBtn} className="back-btn">
                        <img src={leftArrow} alt="arrow pixel button image" />
                    </button>
                </div>
                    Logged in as:{" "}
                    <span className="username">{user ? user.name : "Guest"}</span>
                </h1>
                <div className="chats-section">
                    
                <div className="channels-list">
                    {chats.map((chat) => {
                      
                        const isSender = chat.participants[0] === user?._id;
                  
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

                        {usersList
                        .filter(listUser => listUser._id !== user?._id)
                        .map(user => (
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
                    {!user || user.name === 'Guest' ? (
                        <div className="unauthorized-message">
                            Sorry, private messages are only for authorized users. Please, log in to start chatting.
                        </div>
                    ): !selectedChannelId ? (
                        <div className="unauthorized-message">
                            Choose a user to start chatting
                        </div>

                    ) : (
                        <>
                        </>
                    )}
                    {selectedChannelId && user && (
                        <div className="messages-list">
                        <h2 className="messages-header">Messages</h2>
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