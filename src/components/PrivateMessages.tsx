import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Home.css";

interface JwtPayload {
    name: string;
    userId: string;
    [key: string]: any;
}
interface User {
    name: string;
    userId: string;
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

 
    useEffect(() => {
        const fetchChats = async () => {
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
                setChats(data);

                // if (data.length > 0) {
                //     setSelectedChannelId(data[0]._id);
                //   }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        const fetchPrivateMessages = async () => {
            if (!selectedChannelId) return;

            try {
                const headers: HeadersInit = {};
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = token;
                }

                console.log("Fetching messages for chat ID:", selectedChannelId);
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

        fetchPrivateMessages(); // Загружаем приватные сообщения каждый раз, когда выбранный чат изменяется
    }, [selectedChannelId]);

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

    const handleSendMessage = async () => {
        // 1. Проверяем, есть ли сообщение и выбранный чат
        if (!newMessage.trim() || !selectedChannelId) return;
     
        try {
            // 2. Готовим заголовки с токеном
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token") || ''
            };
     
            // 3. Находим информацию о получателе из текущего чата
            const currentChat = chats.find(chat => chat._id === selectedChannelId);
            if (!currentChat) return;
     
            // 4. Отправляем запрос
            const response = await fetch('/api/private-messages', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    content: newMessage,
                    recipientId: currentChat.participants.find((id: string | undefined) => id !== user?.userId), // ID получателя
                    recipientName: currentChat.recipientName // Имя получателя
                })
            });
     
            // 5. Проверяем успешность запроса
            if (response.ok) {
                // 6. Очищаем поле ввода
                setNewMessage('');
                
                // 7. Обновляем список сообщений
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

     return (
        <div className="home-container">
            <div className="channels-panel">
                <h1 className="user-header">
                    Logged in as:{" "}
                    <span className="username">{user ? user.name : "Guest"}</span>
                </h1>
                
                <div className="channels-list">
                    {chats.map((chat) => {
                        // Определяем, является ли текущий пользователь отправителем
                        const isSender = chat.participants[0] === user?.userId;
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
     
            <div className="messages-panel">
                <div className="messages-container">
                    <h2 className="messages-header">Messages</h2>
                    {selectedChannelId && !user && (
                        <div className="unauthorized-message">
                            Sorry, private messages are only for authorized users
                        </div>
                    )}
                    {selectedChannelId && user && (
                        <div className="messages-list">
                            {privateMessages.map((message) => (
                                <div key={message._id} className="message-item">
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
