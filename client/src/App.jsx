import { useState } from 'react';
import { useSocket } from './socket/socket';
import Chat from './components/Chat'; // Import the new component
import './App.css';

function App() {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    messages, // Array of messages from server
    sendMessage, // Function to send message
    users, 
    typingUsers,
    setTyping 
  } = useSocket();
  
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if(username.trim()) {
      connect(username);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    disconnect();
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <div className="App">
      <h1>Socket.io Chat</h1>
      
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <button type="submit">Join Chat</button>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Welcome, {username}!</h3>
              <button onClick={handleLogout} style={{ backgroundColor: '#ff4444', padding: '5px 15px' }}>
                Leave
              </button>
            </div>
            
            {/* Render the Chat Component */}
            <Chat 
              messages={messages}
              sendMessage={sendMessage}
              users={users}
              typingUsers={typingUsers}
              username={username}
              setTyping={setTyping}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;