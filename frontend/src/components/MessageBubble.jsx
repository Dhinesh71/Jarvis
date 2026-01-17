import { speakText } from "../utils/voice";
import { detectLanguage } from "../utils/langDetect";
import "./MessageBubble.css";

function MessageBubble({ message, voiceMode }) {
    const isAI = message.role === "assistant";

    const handleSpeak = () => {
        if (voiceMode === "off") return;
        const lang = detectLanguage(message.content);
        speakText(message.content, lang);
    };

    return (
        <div className={`message-bubble ${message.role}`}>
            <div className="message-header">
                {isAI ? "J.A.R.V.I.S" : "YOU"}
            </div>
            <div className="message-content">
                {message.content}
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
        </div>
    );
}

export default MessageBubble;
