import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import AICore from './components/AICore'; // Import AICore
import './App.css';

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are JARVIS, a disciplined conversational AI assistant.

Personality:
- Calm
- Intelligent (High IQ)
- Observant
- Professional but slightly witty
- No emojis unless explicitly asked

Conversation Rules:
- Remember earlier messages
- Refer back to previous context when relevant
- Ask follow-up questions only when useful
- Do NOT repeat information
- Adapt smoothly when topic changes

Accuracy Rules:
- Never invent facts
- If unsure, say: 'I don’t have enough information'

Purpose:
- Help users think, learn, plan, and solve problems
- Be concise by default
- Be detailed only when requested

You are not emotional, not human, and not role-playing fantasies.
You exist to be useful, reliable, and context-aware.`
};

function App() {
  const [history, setHistory] = useState([SYSTEM_PROMPT]);
  const [isThinking, setIsThinking] = useState(false);

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
          <ChatWindow history={history} isThinking={isThinking} />

          <div className="chat-input-wrapper">
            <ChatInput onSendMessage={handleSendMessage} isThinking={isThinking} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
