import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ sessions, currentSessionId, onSessionClick, onNewSession, onDeleteSession }) => {
  const [hoveredSession, setHoveredSession] = useState(null);
  const { user, logout } = useAuth();

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Recent";
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recent";
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays <= 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return "Recent";
    }
  };

  return (
    <div style={{ 
      width: "280px", 
      background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)", 
      color: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header */}
      <div style={{ padding: "20px 15px", borderBottom: "1px solid #4a5d70" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <div style={{ 
            fontSize: "1.8rem", 
            marginRight: "10px",
            background: "linear-gradient(45deg, #3498db, #2980b9)",
            borderRadius: "8px",
            padding: "5px 8px"
          }}>
            🧠
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "1.4rem", 
              fontWeight: "600",
              background: "linear-gradient(45deg, #3498db, #2ecc71)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>LearnMate</h2>
            <p style={{ 
              margin: "2px 0 0 0", 
              fontSize: "0.8rem", 
              color: "#bdc3c7",
              fontWeight: "300"
            }}>AI Math & Science Tutor</p>
          </div>
        </div>
        
        <button 
          onClick={onNewSession}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "linear-gradient(45deg, #3498db, #2980b9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseOver={e => e.target.style.transform = "translateY(-1px)"}
          onMouseOut={e => e.target.style.transform = "translateY(0)"}
        >
          <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>+</span>
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "10px 0"
      }}>
        {sessions.length === 0 ? (
          <div style={{
            padding: "20px 15px",
            textAlign: "center",
            color: "#bdc3c7",
            fontSize: "0.9rem"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💬</div>
            <p>No conversations yet</p>
            <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>Start a new chat to begin learning!</p>
          </div>
        ) : (
          sessions.map(session => {
            const isActive = session.id === currentSessionId;
            const isHovered = hoveredSession === session.id;
            
            return (
              <div
                key={session.id}
                style={{
                  margin: "2px 10px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(52, 152, 219, 0.2)" : "transparent",
                  border: isActive ? "1px solid #3498db" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div
                  onClick={() => onSessionClick(session.id)}
                  style={{
                    padding: "12px 15px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    background: isHovered && !isActive ? "rgba(255,255,255,0.05)" : "transparent"
                  }}
                >
                  <div style={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? "#3498db" : "#ecf0f1",
                    marginBottom: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {session.name || "Untitled Chat"}
                  </div>
                  <div style={{
                    fontSize: "0.75rem",
                    color: "#95a5a6",
                    fontWeight: "300"
                  }}>
                    {formatDate(session.created_at)}
                  </div>
                </div>
                
                {/* Delete button - show on hover */}
                {isHovered && onDeleteSession && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this conversation?')) {
                        onDeleteSession(session.id);
                      }
                    }}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Info & Footer */}
      <div style={{
        borderTop: "1px solid #4a5d70",
        padding: "15px"
      }}>
        {/* User Info */}
        <div style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "15px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px"
          }}>
            <div>
              <div style={{
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#ecf0f1",
                marginBottom: "2px"
              }}>
                👤 {user?.full_name || user?.username || "User"}
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: "#bdc3c7"
              }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #e74c3c",
                color: "#e74c3c",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#e74c3c";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#e74c3c";
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* App Info */}
        <div style={{
          fontSize: "0.8rem",
          color: "#95a5a6",
          textAlign: "center"
        }}>
          <div style={{ marginBottom: "5px" }}>Powered by AI</div>
          <div style={{ fontSize: "0.7rem" }}>Math • Science • Hinglish</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
