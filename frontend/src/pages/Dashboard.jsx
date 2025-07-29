import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../components/CreateGroupModal';
import API from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        console.log("Acessing local storage");
        const token = localStorage.getItem('token');
        console.log("Token retrieved: " + token);
        if (!token) {
            navigate('/');
        }
	/*
        const fetchData = async () => {
            try {
                const userRes = await API.get('/users/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(userRes.data);

                const groupRes = await API.get('/groups/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGroups(groupRes.data);

            } catch (err) {
                console.error('Error fetching users or groups:', err);
            }
        };
	*/

	// Attempting to fix r.map issue when loading dashboard
	const fetchData = async () => {
  	  try {
    	    const userRes = await API.get('/users/', {
              headers: { Authorization: `Bearer ${token}` }
            });

    	    if (Array.isArray(userRes.data)) {
              setUsers(userRes.data);
            } else {
              console.warn("User API response is not an array:", userRes.data);
              setUsers([]);
            }

            const groupRes = await API.get('/groups/', {
               headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(groupRes.data)) {
              setGroups(groupRes.data);
            } else {
                console.warn("Group API response is not an array:", groupRes.data);
                setGroups([]);
            }

          } catch (err) {
            console.error('Error fetching users or groups:', err);
            setUsers([]);
            setGroups([]);
          }
        };



        fetchData();
    }, [navigate]);


    return (
        <div className="dashboard-container">
            <div className="title-contents">
                <h1>Chatter</h1>
                <p>Welcome! You are set to go.</p>
                <button className="logout-button"
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/');
                    }}>
                    Logout
                </button>
            </div>

            <h3>Group Chats:
                <button className="gc-create-btn" onClick={() => setShowModal(true)}>
                    Create Group Chat
                </button>
            </h3>
            <p>Here are your chats</p>
            {groups.length === 0 ? (
                <p>No groups yet.</p>
            ) : (
                <ul className="group-list">
                    {groups.map(group => (
                        <li key={group.id} className="group-item">
                            {group.name}
                            <button className="group-chat-button" onClick={() => navigate(`/groupchat/${group.id}`)}>Enter Chat</button>
                        </li>
                    ))}
                </ul>
            )}
            <h3>Direct Messages:</h3>
            <p>Other Users you can chat to</p>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user.id} className="user-item">
                        {user.username}
                        <button className="chat-button" onClick={() => navigate(`/chat/${user.id}`)} style={{ marginLeft: 10 }}>
                            Message
                        </button>
                    </li>
                ))}
            </ul>
            {showModal && (
                <CreateGroupModal
                    onClose={() => setShowModal(false)}
                    onGroupCreated={() => {
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );

};

export default Dashboard;
