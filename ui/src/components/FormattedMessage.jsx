import React from 'react';

const FormattedMessage = ({ content, role }) => {
  const formatContent = (text) => {
    if (!text) return '';
    
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n');
      
      return (
        <div key={pIndex} style={{ marginBottom: '16px' }}>
          {lines.map((line, lIndex) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) return null;
            
            // Headers (lines starting with #)
            if (trimmedLine.startsWith('###')) {
              return (
                <h4 key={lIndex} style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: role === 'user' ? '#ffffff' : '#2c3e50',
                  margin: '12px 0 8px 0',
                  lineHeight: '1.3'
                }}>
                  {trimmedLine.replace(/^###\s*/, '')}
                </h4>
              );
            }
            
            if (trimmedLine.startsWith('##')) {
              return (
                <h3 key={lIndex} style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: role === 'user' ? '#ffffff' : '#2c3e50',
                  margin: '14px 0 10px 0',
                  lineHeight: '1.3'
                }}>
                  {trimmedLine.replace(/^##\s*/, '')}
                </h3>
              );
            }
            
            if (trimmedLine.startsWith('#')) {
              return (
                <h2 key={lIndex} style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: role === 'user' ? '#ffffff' : '#1a365d',
                  margin: '16px 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {trimmedLine.replace(/^#\s*/, '')}
                </h2>
              );
            }
            
            // Numbered lists
            if (/^\d+\.\s/.test(trimmedLine)) {
              return (
                <div key={lIndex} style={{
                  display: 'flex',
                  margin: '6px 0',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: role === 'user' ? '#e3f2fd' : '#007bff',
                    minWidth: '24px',
                    fontSize: '0.95rem'
                  }}>
                    {trimmedLine.match(/^\d+\./)[0]}
                  </span>
                  <span style={{
                    marginLeft: '8px',
                    lineHeight: '1.5',
                    fontSize: '0.95rem'
                  }}>
                    {formatInlineText(trimmedLine.replace(/^\d+\.\s*/, ''))}
                  </span>
                </div>
              );
            }
            
            // Bullet points
            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
              return (
                <div key={lIndex} style={{
                  display: 'flex',
                  margin: '6px 0',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    color: role === 'user' ? '#e3f2fd' : '#007bff',
                    fontWeight: '600',
                    minWidth: '16px',
                    fontSize: '0.95rem'
                  }}>
                    •
                  </span>
                  <span style={{
                    marginLeft: '8px',
                    lineHeight: '1.5',
                    fontSize: '0.95rem'
                  }}>
                    {formatInlineText(trimmedLine.replace(/^[•\-*]\s*/, ''))}
                  </span>
                </div>
              );
            }
            
            // Code blocks (lines starting with 4 spaces or tab)
            if (trimmedLine.startsWith('    ') || trimmedLine.startsWith('\t')) {
              return (
                <pre key={lIndex} style={{
                  background: role === 'user' ? 'rgba(255,255,255,0.15)' : '#f8f9fa',
                  border: role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '12px',
                  margin: '8px 0',
                  fontSize: '0.85rem',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  color: role === 'user' ? '#ffffff' : '#495057',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {trimmedLine}
                </pre>
              );
            }
            
            // Math expressions (simple detection)
            if (trimmedLine.includes('=') && /[\d\w]\s*[+\-*/=]\s*[\d\w]/.test(trimmedLine)) {
              return (
                <div key={lIndex} style={{
                  background: role === 'user' ? 'rgba(255,255,255,0.1)' : '#e8f4fd',
                  border: role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #bee5eb',
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  fontSize: '1rem',
                  fontFamily: 'Georgia, serif',
                  textAlign: 'center',
                  color: role === 'user' ? '#ffffff' : '#0c5460'
                }}>
                  {formatInlineText(trimmedLine)}
                </div>
              );
            }
            
            // Regular paragraphs
            return (
              <p key={lIndex} style={{
                margin: '8px 0',
                lineHeight: '1.6',
                fontSize: '0.95rem',
                textAlign: 'left'
              }}>
                {formatInlineText(trimmedLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };
  
  const formatInlineText = (text) => {
    // Handle **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, (match, content) => 
      `<strong style="font-weight: 600;">${content}</strong>`
    );
    
    // Handle *italic*
    text = text.replace(/\*(.*?)\*/g, (match, content) => 
      `<em style="font-style: italic;">${content}</em>`
    );
    
    // Handle `code`
    text = text.replace(/`(.*?)`/g, (match, content) => 
      `<code style="background: ${role === 'user' ? 'rgba(255,255,255,0.2)' : '#f1f3f4'}; padding: 2px 4px; border-radius: 3px; font-family: Monaco, Consolas, monospace; font-size: 0.9em;">${content}</code>`
    );
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };
  
  return (
    <div style={{
      lineHeight: '1.5',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }}>
      {formatContent(content)}
    </div>
  );
};

export default FormattedMessage;