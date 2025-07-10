import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import '../styles/CreateGroupModal.css';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState([]);

    

    const token = localStorage.getItem('token');

    useEffect(() => {
        API.get('/users', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUsers(res.data));
    }, []);

    const toggleUser = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const createGroup = async () => {
        if (!groupName.trim()) {
            alert("Please provide a group name");
            return;
        }
        // Checking if at least two people + user have been selected
        if (selected.length < 2) {
            alert("Please select at least 2 participants.");
            return;
        }
        
        try {
            await API.post('/groups/', {
                name: groupName,
                member_ids: selected
            }, {
                headers: { Authorization: `Bearer ${token}`}
            });
            onGroupCreated();
            onClose();
        } catch (err) {
            console.error('Failed to create group:', err);
        }
    };

    return (
        <div className='modal-overlay'>
            <div className='modal-content'>
                <h3>Create New Group</h3>
                <input 
                  type="text"
                  placeholder="Enter Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <div className="user-list">
                    {users.map(users => (
                        <label key={users.id}>
                            <input
                              type="checkbox"
                              value={users.id}
                              onChange={() => toggleUser(users.id)}
                            />
                            {users.username}
                        </label>
                    ))}
                </div>
                <button onClick={createGroup}>Create Group</button>
                <button onClick={onClose} className="close-btn">Close</button>
            </div>
        </div>
    );
};

export default CreateGroupModal;