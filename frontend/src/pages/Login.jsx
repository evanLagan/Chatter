import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [form, setForm ] = useState({ username: '', password: '' });
    const [error, setError ] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', form);
            localStorage.setItem('token', res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid Credentials');
        }
    };

    return (
     <div className="login-container">
        <div className="login-box">
            <h2>Chatter</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                /><br />
                <input 
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                /><br />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Create one here</Link></p>
        </div>
     </div>
    );
};

export default Login;