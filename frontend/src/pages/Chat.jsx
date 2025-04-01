import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const Chat = () => {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const token = localStorage.getItem('token');

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

    useEffect(() => {
        fetchMessages();
    }, [userId]);


    return (
        <div>
            <h2>Chat with User #{userId}</h2>
            <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <b>{msg.sender_id === parseInt(userId) ? `Them`: `You`}:</b> {msg.content}
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