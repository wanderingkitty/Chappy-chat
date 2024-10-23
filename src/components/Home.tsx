import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Home.css';

interface Channel {
    _id: string;
    name: string;          
    channelId: string;
    members: string;   
    isPrivate: boolean;
}

interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: Date;
}

interface User {
    name: string;
    userId: string;
}

interface JwtPayload {
    name: string;
    userId: string;
    [key: string]: any;
}

const HomePage = () => {
    const [searchParams] = useSearchParams();
    const channelType = searchParams.get('channel');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<User | null>(null);


	useEffect(() => {
		const token = localStorage.getItem('token');
		
		if (token) {
			try {
				const userData = jwtDecode<JwtPayload>(token);
				setUser({
					name: userData.name,
					userId: userData.userId
				});
			} catch (error) {
				console.error("Error decoding token:", error);
				localStorage.removeItem('token');
			}
		}
	}, []);
	
	useEffect(() => {
		const fetchChannels = async () => {
			try {
				const headers: HeadersInit = {};
				const token = localStorage.getItem('token');
				if (token) {
					headers.Authorization = token;
				}
				
				const response = await fetch('/api/channels', { headers });
				const data = await response.json();
				
				const filteredChannels = data.filter((channel: Channel) => {
					if (channelType === 'CODING') {
						return channel.name === "Coding";
					} else if (channelType === 'STACK') {
						// Если канал приватный и пользователь не авторизован, не показываем его
						if (channel.isPrivate && !user) {
							return false;
						}
						return channel.name === "Stack Overflow & Chill";
					}
					return false;
				});
				
				setChannels(filteredChannels);
				
				if (filteredChannels.length > 0) {
					setSelectedChannelId(filteredChannels[0]._id);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		
		fetchChannels();
	}, [channelType, user]);
	
	useEffect(() => {
		const fetchMessages = async () => {
			if (!selectedChannelId) return;
			
			try {
				const headers: HeadersInit = {};
				const token = localStorage.getItem('token');
				if (token) {
					headers.Authorization = token;
				}
				
				const response = await fetch(`/api/messages/${selectedChannelId}`, { headers });
				if (response.status === 403) {
					setMessages([]);
					return;
				}
				const data = await response.json();
				setMessages(data);
			} catch (error) {
				console.error("Error fetching messages:", error);
			}
		};
		
		fetchMessages();
	}, [selectedChannelId]);
	
	const handleChannelClick = (channelId: string) => {
		setSelectedChannelId(channelId);
	};
	
	return (
		<div className="home-container">
			<div className="channels-panel">
			<h1 className="user-header">
   				 Logged in as: <span className="username">{user ? user.name : 'Guest'}</span>
			</h1>
	
				<ul className="channels-list">
					{channels.map(channel => {
						// Определяем класс для канала
						let channelClass = "channel-item";
						if (selectedChannelId === channel._id) {
							channelClass += " selected";
						}
	
						return (
							<li 
								key={channel._id}
								onClick={() => handleChannelClick(channel._id)}
								className={channelClass}
							>
								<div className="channel-content">
									<span className="channel-name">{channel.name}</span>
									{/* Показываем замок если канал приватный */}
									{channel.isPrivate && <span className="private-icon">🔒</span>}
								</div>
							</li>
						)
					})}
				</ul>
			</div>
			
			<div className="messages-panel">
				<div className="messages-container">
					<h2 className="messages-header">Messages</h2>
	
					{/* Проверяем выбран ли канал */}
					{selectedChannelId && (
						<div>
							{/* Проверяем доступ к приватному каналу */}
							{channels.find(c => c._id === selectedChannelId)?.isPrivate && !user ? (
								<div className="unauthorized-message">
									Sorry, this channel is only for authorized users
								</div>
							) : (
								<div className="messages-list">
									{messages.map(message => (
										<div key={message._id} className="message-item">
											<div className="message-header">
												<div className="sender-name">
													{message.senderName}
												</div>
												<div className="message-time">
													{new Date(message.createdAt).toLocaleString()}
												</div>
											</div>
											<div className="message-content">
												{message.content}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default HomePage;