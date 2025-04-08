import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log("Acessing local storage");
        const token = localStorage.getItem('token');
        console.log("Token retrieved: " + token);
        if (!token) {
            navigate('/');
        }
        
        const fetchUsers = async () => {
            try {
                const result = await API.get('/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(result.data);
            } catch (err) {
                console.error('Error fetching users:', err);
                // Handle token expiration or bad credentials
                localStorage.removeItem('token');
                navigate('/');
            } 
        };

        fetchUsers();
    }, [navigate]);


    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <p>Welcome! You are set to go.</p>
            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/');
                }}>
                Logout
            </button>
            <p>Users you can chat with:</p>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user.id} className="user-item">
                        {user.username}
                        <button className="chat-button" onClick={() => navigate(`/chat/${user.id}`)} style={{marginLeft: 10}}>
                            Message
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

};

export default Dashboard;