import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

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
        <div>
            <h2>Dashboard</h2>
            <p>Welcome! You are set to go.</p>
            <p>Other users you can chat with:</p>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.username} - joined on {new Date(user.created_at).toLocaleDateString()}
                    </li>
                ))}
            </ul>
            <button 
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/');
                }}>
                Logout
            </button>
        </div>
    );

};

export default Dashboard;