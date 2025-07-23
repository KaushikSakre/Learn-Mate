import React, { useState, useRef, useEffect } from "react";
import FormattedMessage from "./FormattedMessage";

const ChatWindow = ({ messages, onSend, isLoading }) => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (input.trim() || selectedFile) {
      onSend(input, selectedFile);
      setInput("");
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
    } else {
      alert('Please select an image or PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      padding: "20px", 
      overflow: "hidden",
      background: "#f8f9fa"
    }}>
      {/* Header */}
      <div style={{
        padding: "15px 0",
        borderBottom: "2px solid #e9ecef",
        marginBottom: "20px"
      }}>
        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "1.5rem" }}>LearnMate Chat</h2>
        <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "0.9rem" }}>Ask questions in text or upload images/diagrams</p>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        paddingRight: "10px",
        marginBottom: "20px"
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#6c757d",
            marginTop: "30px",
            fontSize: "1rem"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🧠📚</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Welcome to LearnMate!</h3>
            <p style={{ fontSize: "1rem", marginBottom: "25px", color: "#495057" }}>
              Your friendly AI tutor for Class 9-10 Math & Science
            </p>
            
            <div style={{ 
              background: "#f8f9fa", 
              borderRadius: "12px", 
              padding: "20px", 
              margin: "20px auto",
              maxWidth: "500px",
              border: "1px solid #e9ecef"
            }}>
              <h4 style={{ color: "#495057", marginBottom: "15px" }}>Try asking:</h4>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>📐 "Explain Pythagorean theorem with examples"</p>
                <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>🧪 "What is photosynthesis in simple terms?"</p>
                <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>📊 "Help me solve quadratic equations"</p>
                <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>🖼️ Upload math problems or diagrams</p>
              </div>
            </div>
            
            <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#6c757d" }}>
              Just type "Hi" or "Enter your query" to get started! 👋
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              margin: "15px 0"
            }}>
              <div className="message-bubble" style={{
                maxWidth: "80%",
                minWidth: "200px",
                padding: "16px 20px",
                borderRadius: "20px",
                background: msg.role === "user" ? 
                  "linear-gradient(135deg, #007bff 0%, #0056b3 100%)" : 
                  "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                color: msg.role === "user" ? "white" : "#333",
                boxShadow: msg.role === "user" ? 
                  "0 4px 12px rgba(0,123,255,0.3)" : 
                  "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "0.95rem",
                lineHeight: "1.4",
                border: msg.role === "assistant" ? "1px solid #e9ecef" : "none",
                position: "relative"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    position: "absolute",
                    top: "-8px",
                    left: "20px",
                    background: "#28a745",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "500"
                  }}>
                    🧠 LearnMate
                  </div>
                )}
                <div className="formatted-content">
                  <FormattedMessage content={msg.content} role={msg.role} />
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            margin: "15px 0"
          }}>
            <div style={{
              padding: "12px 16px",
              borderRadius: "18px",
              background: "#ffffff",
              border: "1px solid #e9ecef",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#007bff",
                  margin: "0 2px",
                  animation: "pulse 1.5s ease-in-out infinite"
                }}></div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#007bff",
                  margin: "0 2px",
                  animation: "pulse 1.5s ease-in-out 0.3s infinite"
                }}></div>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#007bff",
                  margin: "0 2px",
                  animation: "pulse 1.5s ease-in-out 0.6s infinite"
                }}></div>
                <span style={{ marginLeft: "10px", color: "#6c757d" }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* File Upload Area */}
      {selectedFile && (
        <div style={{
          padding: "10px",
          background: "#e3f2fd",
          border: "1px solid #2196f3",
          borderRadius: "8px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "10px" }}>📎</span>
            <span style={{ fontSize: "0.9rem" }}>{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#f44336",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >×</button>
        </div>
      )}

      {/* Input Area */}
      <div 
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "15px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: dragOver ? "2px dashed #007bff" : "1px solid #e9ecef"
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.95rem",
                resize: "none",
                minHeight: "44px",
                maxHeight: "120px",
                outline: "none",
                fontFamily: "inherit"
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about Science or Math... (Shift+Enter for new line)"
              disabled={isLoading}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => handleFileSelect(e.target.files[0])}
              accept="image/*,.pdf"
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "12px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              disabled={isLoading}
              title="Upload image or PDF"
            >
              📎
            </button>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              style={{
                padding: "12px 20px",
                background: (!input.trim() && !selectedFile) || isLoading ? "#e9ecef" : "#007bff",
                color: (!input.trim() && !selectedFile) || isLoading ? "#6c757d" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: (!input.trim() && !selectedFile) || isLoading ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                fontWeight: "500"
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
        {dragOver && (
          <div style={{
            marginTop: "10px",
            textAlign: "center",
            color: "#007bff",
            fontSize: "0.9rem"
          }}>
            Drop your image or PDF here
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
