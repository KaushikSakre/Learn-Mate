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
      width: "320px", 
      background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)", 
      color: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "28px 24px", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ 
            fontSize: "2rem", 
            marginRight: "12px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            borderRadius: "12px",
            padding: "8px 10px",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}>
            🧠
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "1.6rem", 
              fontWeight: "700",
              background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>LearnMate</h2>
            <p style={{ 
              margin: "2px 0 0 0", 
              fontSize: "0.85rem", 
              color: "#cbd5e1",
              fontWeight: "400"
            }}>AI Math & Science Tutor</p>
          </div>
        </div>
        
        <button 
          onClick={onNewSession}
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}
          onMouseOver={e => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
          }}
          onMouseOut={e => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
          }}
        >
          <span style={{ 
            marginRight: "10px", 
            fontSize: "1.2rem",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            padding: "2px 6px"
          }}>+</span>
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "16px 0"
      }}>
        {sessions.length === 0 ? (
          <div style={{
            padding: "32px 24px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "0.95rem"
          }}>
            <div style={{ 
              fontSize: "3rem", 
              marginBottom: "16px",
              background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>💬</div>
            <p style={{ 
              fontSize: "1rem", 
              fontWeight: "500", 
              marginBottom: "8px",
              color: "#e2e8f0"
            }}>No conversations yet</p>
            <p style={{ 
              fontSize: "0.85rem", 
              color: "#94a3b8",
              lineHeight: "1.4"
            }}>Start a new chat to begin your learning journey!</p>
          </div>
        ) : (
          sessions.map(session => {
            const isActive = session.id === currentSessionId;
            const isHovered = hoveredSession === session.id;
            
            return (
              <div
                key={session.id}
                style={{
                  margin: "4px 16px",
                  borderRadius: "12px",
                  background: isActive ? "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.15) 100%)" : "transparent",
                  border: isActive ? "1px solid rgba(37, 99, 235, 0.4)" : "1px solid transparent",
                  transition: "all 0.3s ease",
                  position: "relative",
                  boxShadow: isActive ? "0 2px 8px rgba(37, 99, 235, 0.2)" : "none"
                }}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div
                  onClick={() => onSessionClick(session.id)}
                  style={{
                    padding: "16px 18px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    background: isHovered && !isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#60a5fa" : "#f1f5f9",
                    marginBottom: "6px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.3"
                  }}>
                    💬 {session.name || "Untitled Chat"}
                  </div>
                  <div style={{
                    fontSize: "0.8rem",
                    color: isActive ? "#cbd5e1" : "#94a3b8",
                    fontWeight: "400"
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
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#dc2626";
                      e.target.style.transform = "translateY(-50%) scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#ef4444";
                      e.target.style.transform = "translateY(-50%) scale(1)";
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
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "20px 24px",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      }}>
        {/* User Info */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px"
          }}>
            <div>
              <div style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#f1f5f9",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{ 
                  marginRight: "8px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  borderRadius: "8px",
                  padding: "4px 6px",
                  fontSize: "0.8rem"
                }}>👤</span>
                {user?.full_name || user?.username || "User"}
              </div>
              <div style={{
                fontSize: "0.8rem",
                color: "#cbd5e1"
              }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ef4444";
                e.target.style.color = "white";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#ef4444";
                e.target.style.transform = "scale(1)";
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* App Info */}
        <div style={{
          fontSize: "0.85rem",
          color: "#94a3b8",
          textAlign: "center",
          padding: "12px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ 
            marginBottom: "6px",
            fontWeight: "500",
            color: "#cbd5e1"
          }}>✨ Powered by AI</div>
          <div style={{ 
            fontSize: "0.75rem",
            color: "#94a3b8",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>Math</span>
            <span style={{ color: "#60a5fa" }}>•</span>
            <span>Science</span>
            <span style={{ color: "#60a5fa" }}>•</span>
            <span>Hinglish</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
