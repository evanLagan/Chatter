# Chatter

Chatter is a full-stack chat application built with React and FastAPI.

The key features include:

- User authentication with JWT (manually implemented)
- One-on-one direct messaging
- Group chat functionality
- Real-time communication using WebSockets

## Preview

Login page:

![App screenshot](/assets/login.png)

Dashboard:

![App screenshot](/assets/dashboard.png)

Group chat:

![App screenshot](/assets/gc.png)

Live DM messaging:

![Demo](/assets/chatter_dm.gif)


## Installation Instructions

### Requirements

- Python 3.10+
- Node.js 18+ with npm
- PostgreSQL (or SQLite for local dev)
- Virtual environment like `venv`
- Git

---

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```
### 2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file in backend/:
```bash
DATABASE_URL=sqlite:///./chatapp.db
SECRET_KEY=your-secret-key
```

Start the backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Set Up the Frontend
```bash
cd ../frontend
npm install
```

Create a .env file in frontend/:
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Start the frontend dev server:
```bash
npm run dev
```

## Future work
This project is far from finished. Some features that still need to be implemented include message notifications, the ability to edit and delete group chats, some sort of friend system, and other features like editing the backgrounds of group chats, etc.

It's essentially a very barebones project, but it still shows real-time messaging in action.

The site is set up on an AWS EC2 instance, with Nginx serving the frontend, but I haven’t set up a domain name yet (you’ll notice the IP address in the browser URL in the demo), and the backend isn’t persistent yet. I might add a guest mode and some example messages with bots to make it more accessible for demo purposes in the future.


