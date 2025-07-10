import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import GroupChat from './pages/GroupChat';
import './styles/App.css';

function App() {
    return(
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/groupchat/:groupId" element={<GroupChat />} />
        </Routes>
    );
}

export default App;