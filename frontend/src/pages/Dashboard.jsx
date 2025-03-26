import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Acessing local storage");
        const token = localStorage.getItem('token');
        console.log("Token retrieved: " + token);
        if (!token) {
            navigate('/');
        }
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome! You are set to go.</p>
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