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
      padding: "0", 
      overflow: "hidden",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 32px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              color: "#1e293b", 
              fontSize: "1.75rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>LearnMate Chat</h2>
            <p style={{ 
              margin: "4px 0 0 0", 
              color: "#64748b", 
              fontSize: "0.95rem",
              fontWeight: "400"
            }}>Ask questions in text or upload images/diagrams</p>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            borderRadius: "16px",
            padding: "12px 16px",
            border: "1px solid #93c5fd"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🧠</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "20px 32px",
        marginBottom: "0"
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <div style={{ 
              fontSize: "5rem", 
              marginBottom: "24px",
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>🧠📚</div>
            
            <h3 style={{ 
              color: "#1e293b", 
              marginBottom: "16px",
              fontSize: "2.5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>Welcome to LearnMate!</h3>
            
            <p style={{ 
              fontSize: "1.2rem", 
              marginBottom: "40px", 
              color: "#64748b",
              fontWeight: "400",
              lineHeight: "1.6"
            }}>
              Your intelligent AI tutor for Class 9-10 Math & Science
            </p>
            
            <div style={{ 
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", 
              borderRadius: "20px", 
              padding: "32px", 
              margin: "32px auto",
              maxWidth: "600px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)"
            }}>
              <h4 style={{ 
                color: "#374151", 
                marginBottom: "24px",
                fontSize: "1.3rem",
                fontWeight: "600"
              }}>Try asking:</h4>
              
              <div style={{ 
                display: "grid", 
                gap: "16px", 
                textAlign: "left" 
              }}>
                {[
                  { icon: "📐", text: "Explain Pythagorean theorem with examples", color: "#2563eb" },
                  { icon: "🧪", text: "What is photosynthesis in simple terms?", color: "#7c3aed" },
                  { icon: "📊", text: "Matlab ki a² + b + c = 0, toh ka root hai?", color: "#ec4899" },
                  { icon: "🖼️", text: "Upload math problems or diagrams", color: "#10b981" }
                ].map((item, index) => (
                  <div key={index} style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: `1px solid ${item.color}20`,
                    borderLeft: `4px solid ${item.color}`,
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateX(8px)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}20`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  >
                    <span style={{ 
                      marginRight: "12px", 
                      fontSize: "1.2rem" 
                    }}>{item.icon}</span>
                    <span style={{ 
                      fontSize: "1rem",
                      color: "#374151",
                      fontWeight: "500"
                    }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              borderRadius: "16px",
              padding: "20px",
              margin: "24px auto",
              maxWidth: "400px",
              border: "1px solid #93c5fd"
            }}>
              <p style={{ 
                fontSize: "1rem", 
                color: "#1e40af",
                fontWeight: "500",
                margin: "0"
              }}>
                Ready to start learning? Type "Hi" or ask any question! 👋
              </p>
            </div>
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
                padding: "18px 22px",
                borderRadius: "18px",
                background: msg.role === "user" ? 
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : 
                  "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                color: msg.role === "user" ? "white" : "#1f2937",
                boxShadow: msg.role === "user" ? 
                  "0 4px 16px rgba(37, 99, 235, 0.3)" : 
                  "0 4px 16px rgba(0,0,0,0.08)",
                fontSize: "1rem",
                lineHeight: "1.6",
                border: msg.role === "assistant" ? "1px solid #e5e7eb" : "none",
                position: "relative",
                fontWeight: "400"
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
          padding: "12px 16px",
          background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          border: "2px solid #2563eb",
          borderRadius: "10px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ 
              marginRight: "12px", 
              fontSize: "1.4rem",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
            }}>📎</span>
            <span style={{ 
              fontSize: "0.95rem", 
              fontWeight: "500",
              color: "#1e40af"
            }}>{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            style={{
              background: "#ef4444",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
              borderRadius: "6px",
              padding: "4px 8px",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#dc2626";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#ef4444";
              e.target.style.transform = "scale(1)";
            }}
          >×</button>
        </div>
      )}

      {/* Input Area */}
      <div 
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "0",
          padding: "24px 32px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          border: "none",
          borderTop: "1px solid #e2e8f0"
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={{
          background: dragOver ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" : "white",
          borderRadius: "20px",
          padding: "20px",
          border: dragOver ? "2px dashed #2563eb" : "1px solid #e5e7eb",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease"
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                width: "100%",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                padding: "14px 16px",
                fontSize: "1rem",
                resize: "none",
                minHeight: "48px",
                maxHeight: "120px",
                outline: "none",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                lineHeight: "1.5",
                color: "#1f2937",
                background: "#ffffff",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
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
            <div style={{ display: "flex", gap: "10px" }}>
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
                padding: "12px 14px",
                background: "#2563eb",
                color: "white",
                border: "2px solid #1d4ed8",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "1.3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                minWidth: "48px",
                minHeight: "48px"
              }}
              disabled={isLoading}
              title="Upload image or PDF"
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.background = "#1d4ed8";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.background = "#2563eb";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
                }
              }}
            >
              📎
            </button>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || isLoading}
              style={{
                padding: "14px 24px",
                background: (!input.trim() && !selectedFile) || isLoading ? "#e5e7eb" : "#2563eb",
                color: (!input.trim() && !selectedFile) || isLoading ? "#9ca3af" : "white",
                border: "2px solid " + ((!input.trim() && !selectedFile) || isLoading ? "#d1d5db" : "#1d4ed8"),
                borderRadius: "10px",
                cursor: (!input.trim() && !selectedFile) || isLoading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: (!input.trim() && !selectedFile) || isLoading ? "none" : "0 2px 8px rgba(37, 99, 235, 0.3)",
                minHeight: "48px"
              }}
              onMouseOver={(e) => {
                if (!((!input.trim() && !selectedFile) || isLoading)) {
                  e.target.style.background = "#1d4ed8";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                if (!((!input.trim() && !selectedFile) || isLoading)) {
                  e.target.style.background = "#2563eb";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
                }
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
            </div>
          </div>
          {dragOver && (
            <div style={{
              marginTop: "16px",
              textAlign: "center",
              color: "#2563eb",
              fontSize: "1rem",
              fontWeight: "500",
              padding: "12px",
              background: "rgba(37, 99, 235, 0.1)",
              borderRadius: "12px",
              border: "1px dashed #2563eb"
            }}>
              📎 Drop your image or PDF here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
