import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const Chat = () => {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');

    const ws = useRef(null);
    
    const token = localStorage.getItem('token');

    const fetchUsername = async () => {
        try {
            const res = await API.get(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setUsername(res.data.username);
        } catch (err) {
            console.error('Error fetching username:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await API.get(`/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data)
        } catch (err) {
            console.error('Error loading messages: ', err);
        }
    };

    /*
    const sendMessage = async () => {
        if (!content.trim()) return;
        try {
            await API.post('/messages/', {
                receiver_id: parseInt(userId),
                content
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setContent('');
            fetchMessages(); // Refresh the chat
        } catch (err) {
            console.error('Error sending message: ', err);
        }
    };
    */
    
    const sendMessage = () => {
        if (!content.trim()) return;

        const messageData = {
            receiver_id: parseInt(userId),
            content
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(messageData));
            setContent('');
        }
    };

    useEffect(() => {
        fetchUsername();
        fetchMessages();

        // Set up websockets
        ws.current = new WebSocket(`ws://localhost:8000/messages/ws/chat?token=${token}`);

        ws.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        ws.current.onclose = () => {
            console.warn('WebSocket disconnected');
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [userId]);


    return (
        <div>
            <h2>Chatting with: {username} </h2>
            <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <b>{msg.sender_id === parseInt(userId) ? username: `You`}:</b> {msg.content}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '1rem'}}>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    style={{ width: '70%'}}
                />
                <button onClick={sendMessage} style={{ marginLeft: 10 }}>Send</button>
            </div>
        </div>
    );
};


export default Chat