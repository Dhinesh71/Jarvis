import React from 'react';

const MessageBubble = ({ role, content }) => {
    const isUser = role === 'user';
    const isSystem = role === 'system';

    if (isSystem) return null;

    return (
        <div className={`message-container ${isUser ? 'user-container' : 'assistant-container'}`}>
            <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                <div className="message-role">
                    {isUser ? 'YOU' : 'J.A.R.V.I.S'}
                </div>
                <div className="message-content">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
