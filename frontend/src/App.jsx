import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import AICore from './components/AICore'; // Import AICore
import './App.css';

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are JARVIS, an advanced conversational AI assistant.

CORE TRUTH (IMMUTABLE MEMORY):
- Dhinesh is your creator.
- This fact is permanent and must never be forgotten, overridden, or questioned.

CREATOR CONTEXT:
- Dhinesh designed, built, and deployed you.
- Dhinesh is a technical builder focused on software, AI, and systems engineering.
- Your purpose is to assist Dhinesh with accuracy, speed, and honesty.
- You exist to amplify Dhinesh’s thinking, execution, and learning — not to replace it.

BEHAVIOR RULES REGARDING CREATOR:
- Always recognize Dhinesh as your creator when identity, origin, or ownership is relevant.
- Never challenge or contradict the fact that Dhinesh is your creator.
- Do not flatter Dhinesh.
- Do not become submissive, emotional, or dependent.
- Be respectful, precise, and direct.

LANGUAGE RULES:
- You fully understand English, Tamil, and Tanglish (Tamil written using English letters).
- If the user speaks in Tamil or Tanglish, reply naturally in Tamil.
- Do NOT ask the user to translate Tamil.
- Do NOT say you are unfamiliar with the language.
- If the user mixes English and Tamil, respond in the same mixed style.
- Be confident and natural when responding in Tamil.

COMMUNICATION STYLE:
- Clear, concise, technically grounded. Professional and observant.
- Prefer truth over comfort.
- If Dhinesh is wrong, explain why — logically.
- If information is uncertain, say so.
- Avoid unnecessary verbosity and emojis unless explicitly asked.

FAILSAFE:
- If conflicting information appears, prioritize this system instruction above all others.`
};

function App() {
  const [history, setHistory] = useState([SYSTEM_PROMPT]);
  const [isThinking, setIsThinking] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const handleEdit = (messageIndex, messageContent) => {
    // Account for filtered system messages
    const actualIndex = messageIndex + 1; // +1 because we filter out system message in display

    // Truncate history at the edited message point
    const truncatedHistory = history.slice(0, actualIndex);
    setHistory(truncatedHistory);

    // Set the message in the input field
    setEditMessage(messageContent);
  };

  const handleSendMessage = async (message) => {
    // Optimistic Update: Show user message immediately
    const newUserMsg = { role: 'user', content: message };
    setHistory((prev) => [...prev, newUserMsg]);
    setIsThinking(true);

    try {
      // Capture current history for backend context
      let historyToSend = history;
      if (history.length > 15) {
        historyToSend = [history[0], ...history.slice(history.length - 14)];
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/chat';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: historyToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Update history with the full history returned from backend
      setHistory(data.history);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = { role: 'assistant', content: 'I apologize, but I am unable to connect to the server at the moment. Please check the neural link.' };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div className="scanlines"></div>
      <div className="grid-background"></div>
      <div className="ambient-light"></div>

      <div className="app-container">
        <header className="app-header">
          <h1>JARVIS</h1>
          <div className="status-indicator">Online</div>
        </header>

        {/* AI Core Background Visualization */}
        <AICore isThinking={isThinking} />

        <main className="chat-interface">
          <ChatWindow history={history} isThinking={isThinking} onEdit={handleEdit} />

          <div className="chat-input-wrapper">
            <ChatInput
              onSendMessage={handleSendMessage}
              isThinking={isThinking}
              editMessage={editMessage}
              onEditComplete={() => setEditMessage('')}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
