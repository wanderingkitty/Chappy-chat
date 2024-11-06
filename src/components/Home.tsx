import { useEffect, useState } from "react";
import { useSearchParams,useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import leftArrow from '../assets/left-arrow.png'; 
// import { useUserStore } from "../stores/userStore";

interface Channel {
  _id: string;
  channelId: string;
  name: string;
  members: string;
  isPrivate: boolean;
  parentChannel?: string; 
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

interface User {
  _id: string;
  name: string;
}

interface JwtPayload {
  _id: string;
  name: string;
  [key: string]: any;
}

const HomePage = () => {

  const [searchParams] = useSearchParams();
  const channelType = searchParams.get("channel");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showNewChannelInput, setShowNewChannelInput] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const handleChannelClick = (channelId: string) => {
    setSelectedChannelId(channelId);
  };
  
  const navigate = useNavigate()
  const handleGoBackBtn = () => {
    navigate( '/')
  }

  useEffect(() => {
    const messagesList = document.querySelector('.messages-list');
    if (messagesList) {
        messagesList.scrollTo({
            top: messagesList.scrollHeight,
            behavior: 'smooth'
        });
    }
}, [messages]);

const formatMessage = (content: string) => {
  if (content.includes('```')) {
    const [text, code] = content.split('```');
    return (
      <div>
        <div className="message-text">{text}</div>
        <pre className="code-block">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return <div className="regular-message">{content}</div>;
};

const fetchMessages = async () => {
  if (!selectedChannelId) return;

  try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem("token");
      if (token) {
          headers.Authorization = token;
      }

      console.log("Fetching messages for channel:", selectedChannelId);
      
      const response = await fetch(`/api/messages/${selectedChannelId}`, {
          headers,
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
          console.error("Error response:", response.status);
          if (response.status === 403) {
              setMessages([]);
              return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received messages data:", data);
      console.log("Setting messages state with:", data);
      
      setMessages(data);
  } catch (error) {
      console.error("Full error object:", error);
      console.error("Error fetching messages:", error);
  }
};

const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedChannelId) return;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = token;
    } else {
      headers['access'] = 'guest';
    }

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: newMessage,
        channelId: selectedChannelId,
      
      })
    });

    if (response.ok) {
      setNewMessage("");
      fetchMessages();
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
      try {
          const userData = jwtDecode<JwtPayload>(token);
          setUser({
              _id: userData._id,  
              name: userData.name,
          });
      } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token");
      }
  }
}, [setUser]);

    const fetchChannels = async () => {
      try {
        const headers: HeadersInit = {};
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = token;
        }

        const response = await fetch("/api/channels", { headers });
        const data = await response.json();

        const filteredChannels = data.filter((channel: Channel) => {
          if (channelType === "CODING") {
            return channel.name === "Coding" || channel.parentChannel === "Coding";;
          } else if (channelType === "STACK") {
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

useEffect(() => {
    fetchChannels();
}, [channelType, user]); 

useEffect(() => {
  fetchMessages();
}, [selectedChannelId]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("token") || ''
        };

        const response = await fetch('/api/channels', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: newChannelName,
                members: [],
                parentChannel: "Coding"
            })
        });

        if (response.ok) {
            setNewChannelName("");
            setShowNewChannelInput(false);
            fetchChannels();
        }
    } catch (error) {
        console.error("Error creating channel:", error);
    }
}


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

      {channelType === "CODING" && user && (
        <div className="create-channel-section">
          {!showNewChannelInput ? (
            <button 
              className="create-channel-btn"
              onClick={() => setShowNewChannelInput(true)}
            >
              + Create Channel
            </button>
          ) : (
            <div className="new-channel-input-container">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel name..."
                className="new-channel-input"
              />
              <button 
                onClick={handleCreateChannel}
                className="create-btn"
              >
                Create
              </button>
              <button 
                onClick={() => setShowNewChannelInput(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <ul className="channels-list">
        {channels.map((channel) => {
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
                {channel.isPrivate && (
                  <span className="private-icon">🔒</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>

    <div className="messages-panel">
      <div className="messages-container">
        <h2 className="messages-header">Messages</h2>
        
        {channelType === "STACK" && (!user || user.name === 'Guest') ? (
          <div className="unauthorized-message">
            Sorry, this channel is only for authorized users. Please log in to start chatting.
          </div>
        ) : (
          <>
            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = user && user._id === String(message.senderId);
                  return (
                    <div key={message._id} className={`message-item ${isOwnMessage ? 'message-own' : 'message-other'}`}>
                      <div className="message-header">
                        <div className="sender-name">{message.senderName}</div>
                        <div className="message-time">
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="message-content">
                        {formatMessage(message.content)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {channels.find(channel => channel._id === selectedChannelId)?.name === "Chappy-chat info" ? null : (
              <div className="message-input-section">
                <div className="message-input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();  
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
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default HomePage;