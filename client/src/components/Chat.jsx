import { useState, useEffect, useRef } from 'react';

function Chat({ messages, sendMessage, sendPrivateMessage, users, typingUsers, username, setTyping }) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // null = Global Chat
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser, typingUsers]);

  // 2. FIX: Sync Selected User ID if they reconnect
  useEffect(() => {
    if (selectedUser) {
      // Find the updated user object in the 'users' list
      const updatedUser = users.find(u => u.username === selectedUser.username);
      if (updatedUser && updatedUser.id !== selectedUser.id) {
        console.log(`Updating ID for ${selectedUser.username}: ${selectedUser.id} -> ${updatedUser.id}`);
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setTyping(true); // Notify server we are typing
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  // Handle Sending
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      if (selectedUser) {
        sendPrivateMessage(selectedUser.id, newMessage);
      } else {
        sendMessage(newMessage);
      }
      
      setNewMessage("");
      setTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Filter Messages
  const filteredMessages = messages.filter((msg) => {
    if (!selectedUser) {
      return !msg.isPrivate; // Global Chat
    } else {
      // Private Chat: Check both sender and receiver ID/Name
      const isMyMessageToThem = msg.sender === username && msg.to === selectedUser.id;
      const isTheirMessageToMe = msg.sender === selectedUser.username && msg.isPrivate;
      return isMyMessageToThem || isTheirMessageToMe;
    }
  });

  return (
    <div className="chat-interface" style={{ display: 'flex', gap: '20px', alignItems: 'start', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* SIDEBAR */}
      <div className="user-list" style={{ width: '200px', backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
        <div 
          onClick={() => setSelectedUser(null)}
          style={{ 
            padding: '10px', marginBottom: '15px', cursor: 'pointer',
            backgroundColor: !selectedUser ? '#007bff' : 'transparent',
            borderRadius: '5px', fontWeight: 'bold'
          }}
        >
          🌍 Global Chat
        </div>

        <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          Online Users ({users.length})
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {users.map(user => (
            <li 
              key={user.id} 
              onClick={() => user.username !== username && setSelectedUser(user)}
              style={{ 
                marginBottom: '8px', 
                cursor: user.username !== username ? 'pointer' : 'default',
                padding: '8px',
                borderRadius: '5px',
                backgroundColor: selectedUser?.username === user.username ? '#007bff' : 'transparent',
                opacity: user.username === username ? 0.5 : 1,
                border: selectedUser?.username === user.username ? '1px solid #0056b3' : 'none'
              }}
            >
              <span style={{ width: '8px', height: '8px', backgroundColor: '#00ff00', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
              {user.username} {user.username === username && "(You)"}
            </li>
          ))}
        </ul>
      </div>

      {/* CHAT AREA */}
      <div className="chat-container" style={{ flex: 1 }}>
        <div style={{ textAlign: 'left', marginBottom: '10px', color: '#ccc' }}>
          Current Chat: <strong>{selectedUser ? `Private with ${selectedUser.username}` : "Global Chat"}</strong>
        </div>

        <div className="message-list" style={{ 
          height: '400px', border: '1px solid #444', borderRadius: '8px', 
          overflowY: 'auto', padding: '20px', marginBottom: '10px', // Reduced margin
          backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column'
        }}>
          {filteredMessages.map((msg) => {
            const isMyMessage = msg.sender === username;
            if (msg.system) return <div key={msg.id} style={{ textAlign: 'center', color: '#666', fontSize: '0.8em', margin: '10px 0' }}><em>{msg.message}</em></div>;
            
            return (
              <div key={msg.id} style={{
                  alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                  backgroundColor: isMyMessage ? (msg.isPrivate ? '#6f42c1' : '#007bff') : '#333',
                  color: 'white', padding: '10px 15px', borderRadius: '15px', maxWidth: '70%', marginBottom: '10px', textAlign: 'left',
                  border: msg.isPrivate ? '2px solid #a881ff' : 'none'
                }}>
                {!isMyMessage && <div style={{ fontSize: '0.7em', fontWeight: 'bold', color: '#aaa', marginBottom: '4px' }}>{msg.sender}</div>}
                <div>{msg.message}</div>
                <div style={{ fontSize: '0.6em', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.isPrivate && <span> 🔒</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. TYPING INDICATOR (High Visibility Mode) */}
        <div style={{ 
          height: '24px', 
          textAlign: 'left', 
          color: '#00ff00', // Bright Green
          marginBottom: '5px', 
          fontSize: '0.9em',
          fontWeight: 'bold',
          paddingLeft: '10px',
          visibility: typingUsers.length > 0 ? 'visible' : 'hidden' // Preserve layout space
        }}>
          {typingUsers.length > 0 && (
            <span>
              ✏️ {typingUsers.filter(u => u !== username).join(', ')} is typing...
            </span>
          )}
        </div>

        {/* INPUT */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text" value={newMessage} onChange={handleInputChange}
            placeholder={selectedUser ? `Message ${selectedUser.username}...` : "Type a message..."}
            style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
          />
          <button type="submit" style={{ borderRadius: '25px', padding: '10px 25px', backgroundColor: selectedUser ? '#6f42c1' : '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;