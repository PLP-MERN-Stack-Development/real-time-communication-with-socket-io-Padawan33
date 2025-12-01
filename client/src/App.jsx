import { useState, useEffect } from 'react';
import { useSocket } from './socket/socket';
import Chat from './components/Chat';
import { ToastContainer, toast } from 'react-toastify'; // Import Toast
import 'react-toastify/dist/ReactToastify.css'; // Import Styles
import './App.css';

function App() {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    messages, 
    sendMessage, 
    sendPrivateMessage,
    users, 
    typingUsers,
    setTyping
  } = useSocket();
  
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- NEW: NOTIFICATION LOGIC ---
  useEffect(() => {
    // If we have messages, check the last one
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      // If the message is NOT from me, and NOT a system message
      if (lastMsg.sender !== username && !lastMsg.system) {
        // Play a notification sound (Optional)
        // const audio = new Audio('/notification.mp3'); 
        // audio.play().catch(e => console.log("Audio play failed", e));

        // Show Toast
        if (lastMsg.isPrivate) {
          toast.info(`🔒 Private from ${lastMsg.sender}: ${lastMsg.message}`);
        } else {
          toast.success(`🌍 ${lastMsg.sender}: ${lastMsg.message}`);
        }
      }
    }
  }, [messages, username]); // Run this whenever 'messages' changes

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
      {/* Toast Container needs to be here to render the popups */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
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
            
            <Chat 
              messages={messages}
              sendMessage={sendMessage}
              sendPrivateMessage={sendPrivateMessage}
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