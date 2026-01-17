import React, { useState, useEffect, useRef } from 'react';
import { speechRecognizer } from '../utils/speechRecognition';

const ChatInput = ({ onSendMessage, isThinking, editMessage, onEditComplete }) => {
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Handle edit message
    useEffect(() => {
        if (editMessage) {
            setMessage(editMessage);
            if (onEditComplete) {
                onEditComplete();
            }
        }
    }, [editMessage, onEditComplete]);

    const toggleListening = () => {
        if (isListening) {
            speechRecognizer.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            speechRecognizer.start(
                (transcript) => {
                    setMessage(transcript);
                },
                () => {
                    setIsListening(false);
                },
                (error) => {
                    setIsListening(false);
                    console.error("Mic Error:", error);
                }
            );
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!message.trim() && files.length === 0) return; // Allow sending if just files
        if (isThinking) return;

        // Immediate Mic Shutdown to prevent trickling text
        if (isListening) {
            speechRecognizer.stop();
            setIsListening(false);
        }

        const finalMessage = message.trim();
        const finalFiles = [...files];

        setMessage(''); // Clear input immediately
        setFiles([]);   // Clear files immediately
        onSendMessage(finalMessage, finalFiles);
    };

    return (
        <div className="chat-input-wrapper-inner">
            {files.length > 0 && (
                <div className="file-preview-container">
                    {files.map((file, index) => (
                        <div key={index} className="file-preview-item">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file.name}</span>
                            <button type="button" className="remove-file-btn" onClick={() => removeFile(index)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <form className="chat-input-container" onSubmit={handleSubmit}>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.pdf,.docx,.pptx,.xlsx,.csv,.txt"
                />

                <button
                    type="button"
                    className="attach-button"
                    onClick={triggerFileInput}
                    disabled={isThinking}
                    title="Attach Files"
                >
                    ➕
                </button>

                <button
                    type="button"
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    disabled={isThinking}
                    title={isListening ? "Stop Listening" : "Start Speaking"}
                >
                    {isListening ? "🛑" : "🎤"}
                </button>
                <input
                    type="text"
                    className="chat-input"
                    placeholder={isThinking ? "Jarvis is thinking..." : (files.length > 0 ? "Add a message (optional)..." : "Type a message...")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isThinking}
                />
                <button type="submit" className="send-button" disabled={isThinking || (!message.trim() && files.length === 0)}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
