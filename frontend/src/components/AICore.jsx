import React from 'react';

const AICore = ({ isThinking = false }) => {
    return (
        <div className={`ai-core-container ${isThinking ? 'thinking' : 'idle'}`}>
            <div className="core-ring outer-ring"></div>
            <div className="core-ring mid-ring"></div>
            <div className="core-ring inner-ring"></div>
            <div className="core-center-glow"></div>

            <div className="core-status">
                <span className="scramble-text">
                    {isThinking ? 'PROCESSING DATA...' : 'SYSTEM ONLINE'}
                </span>
            </div>

            <style>{`
                .ai-core-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 300px;
                    height: 300px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                    z-index: 0;
                    transition: all 0.5s ease;
                }

                .thinking {
                    filter: saturate(1.5) brightness(1.2);
                    transform: translate(-50%, -50%) scale(1.1);
                }

                .core-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 243, 255, 0.3);
                    box-shadow: 0 0 15px rgba(0, 243, 255, 0.1);
                    transition: all 0.3s ease;
                }

                .outer-ring {
                    width: 260px;
                    height: 260px;
                    border-top: 1px solid transparent;
                    border-bottom: 1px solid transparent;
                    animation: spin 15s linear infinite;
                }
                
                .thinking .outer-ring {
                    border-color: rgba(255, 0, 200, 0.4);
                    animation-duration: 4s;
                }

                .mid-ring {
                    width: 200px;
                    height: 200px;
                    border: 2px dashed rgba(0, 243, 255, 0.4);
                    animation: spin-reverse 10s linear infinite;
                }

                .thinking .mid-ring {
                    border-color: rgba(255, 255, 255, 0.6);
                    animation-duration: 3s;
                }

                .inner-ring {
                    width: 140px;
                    height: 140px;
                    border: 1px solid rgba(0, 243, 255, 0.6);
                    border-left: 1px solid transparent;
                    border-right: 1px solid transparent;
                    animation: spin 6s linear infinite;
                }
                
                .thinking .inner-ring {
                    border-color: rgba(0, 243, 255, 0.9);
                    box-shadow: 0 0 30px rgba(0, 243, 255, 0.4);
                    animation-duration: 1.5s;
                }

                .core-center-glow {
                    width: 60px;
                    height: 60px;
                    background: radial-gradient(circle, rgba(0,243,255,1) 0%, rgba(0,100,255,0) 70%);
                    border-radius: 50%;
                    box-shadow: 0 0 50px rgba(0, 243, 255, 0.6);
                    animation: pulse-core 3s infinite ease-in-out;
                }

                .thinking .core-center-glow {
                     background: radial-gradient(circle, rgba(255,0,200,1) 0%, rgba(100,0,255,0) 70%);
                     box-shadow: 0 0 60px rgba(255, 0, 200, 0.6);
                     animation: pulse-core 0.8s infinite ease-in-out;
                }

                .core-status {
                    position: absolute;
                    bottom: -60px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.9rem;
                    letter-spacing: 0.2em;
                    color: rgba(0, 243, 255, 0.8);
                    text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
                }

                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
                @keyframes pulse-core {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .ai-core-container {
                         transform: translate(-50%, -50%) scale(0.6);
                    }
                }
            `}</style>
        </div>
    );
};

export default AICore;
