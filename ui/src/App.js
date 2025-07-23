import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import AuthContainer from "./components/Auth/AuthContainer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import axios from "axios";
import "./App.css";

function AppContent() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentSessionId && isAuthenticated) {
      axios.get(`http://localhost:8000/session/${currentSessionId}`).then(res => {
        setMessages(res.data);
      });
    }
  }, [currentSessionId, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px'
          }}>🧠</div>
          <div style={{
            fontSize: '1.2rem',
            color: '#6c757d'
          }}>Loading LearnMate...</div>
        </div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  const fetchSessions = async () => {
    const res = await axios.get("http://localhost:8000/sessions");
    setSessions(res.data);
    if (res.data.length > 0) setCurrentSessionId(res.data[0].id);
  };

  const createNewSession = async () => {
    const res = await axios.post("http://localhost:8000/session");
    await fetchSessions();
    setCurrentSessionId(res.data.session_id);
  };

  const sendMessage = async (userMessage, file = null) => {
    if (!userMessage.trim() && !file) return;

    // Auto-create session if none exists
    if (!currentSessionId) {
      try {
        const sessionRes = await axios.post("http://localhost:8000/session");
        const newSessionId = sessionRes.data.session_id;
        setCurrentSessionId(newSessionId);
        await fetchSessions();
        
        // Continue with the message using the new session
        await sendMessageToSession(newSessionId, userMessage, file);
        return;
      } catch (err) {
        console.error('Error creating session:', err);
        setError('Failed to create new chat. Please try again.');
        return;
      }
    }

    await sendMessageToSession(currentSessionId, userMessage, file);
  };

  const sendMessageToSession = async (sessionId, userMessage, file = null) => {
    setIsLoading(true);
    setError(null);

    try {
      let messageContent = userMessage;
      
      let res;
      
      // Handle file upload
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', sessionId);
        if (userMessage.trim()) {
          formData.append('user_message', userMessage);
        }
        
        messageContent = userMessage.trim() 
          ? `${userMessage} [Image: ${file.name}]`
          : `[Image: ${file.name}]`;
        
        res = await axios.post("http://localhost:8000/chat/image", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await axios.post("http://localhost:8000/chat", {
          session_id: sessionId,
          user_message: messageContent
        });
      }

      setMessages(prev => [
        ...prev,
        { role: "user", content: messageContent },
        { role: "assistant", content: res.data.response }
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Still add user message even if API fails
      setMessages(prev => [
        ...prev,
        { role: "user", content: userMessage || `[Uploaded: ${file?.name}]` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:8000/session/${sessionId}`);
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session.');
    }
  };

  return (
    <div className="App">
      {error && (
        <div className="error" style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          maxWidth: "300px"
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: "10px",
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionClick={setCurrentSessionId}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
      />
      <ChatWindow
        messages={messages}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
