# LearnMate Frontend

A modern React-based user interface for the LearnMate AI educational tutor.

## Features

### 🎨 Modern UI Design
- Clean, professional interface with gradient styling
- Responsive design that works on desktop and mobile
- Smooth animations and hover effects
- Accessible design with proper focus states

### 💬 Chat Interface
- Real-time chat with AI tutor
- Support for both text and image queries
- Session-based conversation history
- Loading states and error handling
- Auto-scroll to latest messages

### 📱 Session Management
- Create new chat sessions
- Browse previous conversations
- Delete unwanted sessions
- Session timestamps and formatting

### 🖼️ Multimodal Support
- Drag-and-drop image upload
- Support for diagrams, equations, and photos
- File type validation
- Image preview before sending

### ⚡ Technical Features
- Built with React 19.1.0
- Axios for API communication
- Modern CSS with flexbox layouts
- Component-based architecture
- Error boundaries and loading states

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- LearnMate backend running on `http://localhost:8000`

### Installation
```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`.

### Build for Production
```bash
npm run build
```

## Project Structure

```
ui/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx  # Main chat interface
│   │   └── Sidebar.jsx     # Session sidebar
│   ├── App.js              # Main application component
│   ├── App.css             # Global styles and responsive design
│   └── index.js            # React entry point
└── package.json            # Dependencies and scripts
```

## Component Overview

### App.js
- Main application state management
- API integration with backend
- Error handling and loading states
- Session and message management

### ChatWindow.jsx
- Chat message display with user/assistant differentiation
- Text input with multiline support
- File upload with drag-and-drop
- Image preview and validation
- Loading indicators during API calls

### Sidebar.jsx
- Session list with hover effects
- New session creation
- Session deletion with confirmation
- Responsive design for mobile
- Gradient styling and branding

## API Integration

The frontend communicates with the FastAPI backend through these endpoints:

- `POST /chat` - Send text messages
- `POST /chat/image` - Send images with optional text
- `GET /sessions` - Retrieve all sessions
- `POST /session` - Create new session
- `GET /session/{id}` - Get session messages
- `DELETE /session/{id}` - Delete session

## Styling

The application uses modern CSS with:
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming
- Responsive breakpoints for mobile
- Smooth animations and transitions
- Accessible focus states

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Development

### Available Scripts
- `npm start` - Development server with hot reload
- `npm run build` - Production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Key Features Implemented
1. ✅ Modern chat interface with professional styling
2. ✅ Image upload with drag-and-drop support
3. ✅ Session management with CRUD operations
4. ✅ Error handling and loading states
5. ✅ Responsive design for mobile devices
6. ✅ Accessibility features (keyboard navigation, focus states)
7. ✅ Real-time chat with conversation history

### Future Enhancements
- Dark mode toggle
- Message search functionality
- Export conversation history
- Voice input support
- Markdown rendering for formatted responses
- Real-time typing indicators