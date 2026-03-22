import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { mentorService } from '../services/api';

const Mentor = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: `👋 Hi! I'm your AI Mentor. Ask me anything - whether it's about tech concepts, programming, career guidance, or any other topic. I'm here to help!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await mentorService.sendMessage(userMessage);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: response.response,
        source: response.source
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What is the difference between REST and GraphQL?",
    "Explain how React hooks work",
    "How do I prepare for coding interviews?",
    "What is machine learning?"
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ padding: '1rem' }}>
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-title">🤖 AI Mentor</div>
            <div className="chat-header-subtitle">
              Ask me anything - tech, career, or general questions
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`message ${msg.type} fade-in`}
                style={msg.error ? { background: 'rgba(176, 136, 196, 0.1)', color: 'var(--danger-color)' } : {}}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.source === 'ai' && (
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.6, 
                    marginTop: '8px',
                    textAlign: 'right'
                  }}>
                    Powered by AI
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="message bot fade-in" style={{ display: 'flex', gap: '8px' }}>
                <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
                <span>Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div style={{ 
              padding: '0 1.5rem 1rem',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-secondary"
                  onClick={() => setInput(q)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={loading}
            />
            <button 
              className="chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
