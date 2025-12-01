import { useState, useEffect, useRef } from 'react';

function Chat({ messages, sendMessage, users, typingUsers, username, setTyping }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null); // To track when to stop "typing"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Input Changes (Typing Indicator logic)
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // 1. Tell server we are typing
    setTyping(true);

    // 2. Clear any existing timeout (debounce)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3. Set a new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
      setTyping(false); // Stop typing immediately on send
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="chat-interface" style={{ display: 'flex', gap: '20px', alignItems: 'start', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* --- LEFT: ONLINE USERS SIDEBAR --- */}
      <div className="user-list" style={{ 
        width: '200px', 
        backgroundColor: '#2a2a2a', 
        padding: '15px', 
        borderRadius: '8px',
        color: 'white',
        textAlign: 'left'
      }}>
        <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          Online Users ({users.length})
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {users.map(user => (
            <li key={user.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#00ff00', borderRadius: '50%', display: 'inline-block' }}></span>
              {user.username} {user.username === username && "(You)"}
            </li>
          ))}
        </ul>
      </div>

      {/* --- RIGHT: CHAT AREA --- */}
      <div className="chat-container" style={{ flex: 1 }}>
        <div className="message-list" style={{ 
          height: '400px', 
          border: '1px solid #444', 
          borderRadius: '8px', 
          overflowY: 'auto', 
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#1a1a1a', // Dark theme background
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.map((msg) => {
            const isMyMessage = msg.sender === username;
            const isSystem = msg.system; // Check if it's a system message (User joined/left)

            if (isSystem) {
              return (
                <div key={msg.id} style={{ textAlign: 'center', color: '#888', fontSize: '0.8em', margin: '10px 0' }}>
                  <em>{msg.message}</em>
                </div>
              );
            }

            return (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                  backgroundColor: isMyMessage ? '#007bff' : '#333',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '15px',
                  maxWidth: '70%',
                  marginBottom: '10px',
                  textAlign: 'left'
                }}
              >
                {!isMyMessage && <div style={{ fontSize: '0.7em', fontWeight: 'bold', color: '#aaa', marginBottom: '4px' }}>{msg.sender}</div>}
                <div>{msg.message}</div>
                <div style={{ fontSize: '0.6em', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <div style={{ height: '20px', textAlign: 'left', fontStyle: 'italic', color: '#888', marginBottom: '5px', fontSize: '0.9em' }}>
          {typingUsers.length > 0 && (
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange} // <-- UPDATED HANDLER
            placeholder="Type a message..."
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '25px', 
              border: '1px solid #444',
              backgroundColor: '#2a2a2a',
              color: 'white'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              borderRadius: '25px', 
              padding: '10px 25px', 
              backgroundColor: '#007bff', 
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;