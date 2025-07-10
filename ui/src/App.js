import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history on initial render (optional)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/history");
        setChatHistory(res.data.history || []);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message && !image) return;

    const formData = new FormData();
    if (message) formData.append("message", message);
    if (image) formData.append("image", image);

    setChatHistory(prev => [...prev, { type: "user", text: message || "(🖼️ Image uploaded)" }]);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/query", formData);
      setChatHistory(prev => [...prev, { type: "bot", text: res.data.answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { type: "bot", text: "❌ Error: " + error.message }]);
    } finally {
      setMessage('');
      setImage(null);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>📚 LearnMate Assistant</h1>

      <div className="chat-box">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-message bot">⏳ Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          placeholder="Ask a question..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
