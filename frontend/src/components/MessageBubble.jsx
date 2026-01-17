import { speakText } from "../utils/voice";
import { detectLanguage } from "../utils/langDetect";
import "./MessageBubble.css";

function MessageBubble({ message, voiceMode, onEdit, messageIndex }) {
    const isAI = message.role === "assistant";
    const isUser = message.role === "user";

    const handleSpeak = () => {
        if (voiceMode === "off") return;
        const lang = detectLanguage(message.content);
        speakText(message.content, lang);
    };

    const handleDownload = () => {
        if (!message.image) return;
        const link = document.createElement("a");
        link.href = message.image;
        link.download = `jarvis_generated_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`message-bubble ${message.role}`}>
            <div className="message-header">
                {isAI ? "J.A.R.V.I.S" : "YOU"}
            </div>
            <div className="message-content">
                {message.content}
                {message.image && !message.video && (
                    <div className="message-image-container">
                        <img src={message.image} alt="Generated Content" className="message-image" />
                        <button
                            className="download-image-btn"
                            onClick={handleDownload}
                            title="Download Image"
                        >
                            ⬇️ Download
                        </button>
                    </div>
                )}
                {message.video && (
                    <div className="message-image-container">
                        <video
                            src={message.video}
                            controls
                            autoPlay
                            loop
                            muted
                            className="message-image" // Reuse image styling for consistent look
                            style={{ borderRadius: '8px', border: '1px solid #bd00ff' }}
                        />
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px', textAlign: 'center' }}>
                            Generated Video
                        </div>
                    </div>
                )}
            </div>

            {isAI && (
                <button
                    className="speak-btn"
                    onClick={handleSpeak}
                    title="Speak"
                >
                    🔊
                </button>
            )}

            {isUser && (
                <button
                    className="edit-btn"
                    onClick={() => onEdit(messageIndex, message.content)}
                    title="Edit message"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            )}
        </div>
    );
}

export default MessageBubble;
