import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import '../styles/GroupChat.css';

const GroupChat = () => {
    const { groupId } = useParams();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [groupName, setGroupName] = useState('');
    const ws = useRef(null);
    const bottomRef = useRef(null);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const fetchGroupInfo = async () => {
        try {
            const res = await API.get(`/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupName(res.data.name);
        } catch (err) {
            console.error("Failed to fetch group info", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await API.get(`/messages/group/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(res.data)
            setMessages(res.data)
        } catch (err) {
            console.error('Error loading group messages:', err);
        }
    }

    const sendMessage = () => {
        if (!content.trim()) return;

        const messageData = {
            sender_id: parseInt(userId),
            content
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(messageData));
            setContent('');
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchGroupInfo();

        //ws.current = new WebSocket(`ws://localhost:8000/messages/ws/group/${groupId}?token=${token}`);
        ws.current = new WebSocket(
            `${import.meta.env.VITE_WS_URL}/messages/ws/group/${groupId}?token=${token}`
        );

        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages(prev => [...prev, msg]);
        };

        ws.current.onclose = () => {
            console.warn('Websocket closed for group chat')
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [groupId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behaviour: 'smooth' });
    }, [messages]);

    return (
        <div className='group-chat-page'>
            <div className='group-chat-container'>
                <h2>Group Chat: {groupName}</h2>
                <div className='group-chat-messages'>
                    {messages.map((msg, idx) => (
                        <div key={idx}>
                            <b>{msg.sender_username}:</b> {msg.content}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                <div className="chat-input">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your message here"
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );

};

export default GroupChat;