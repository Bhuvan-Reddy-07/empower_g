import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, MessageSquare, Send } from 'lucide-react';

const QA_DB: { [key: string]: string } = {
    "default": "I can help you with safety tips. ask me about 'cab safety', 'stalking', 'harassment' or 'emergency contacts'.",
    "cab": "When taking a cab: 1. Share your live location. 2. Verify child lock is off. 3. Call a friend or use the Fake Call feature if you feel unsafe.",
    "taxi": "When taking a cab: 1. Share your live location. 2. Verify child lock is off. 3. Call a friend or use the Fake Call feature if you feel unsafe.",
    "stalking": "If you are being stalked: 1. Walk towards a crowded area (Mall, Shop). 2. Do not go home immediately. 3. Call 100 or press the SOS button.",
    "followed": "If you are being stalked: 1. Walk towards a crowded area (Mall, Shop). 2. Do not go home immediately. 3. Call 100 or press the SOS button.",
    "harassment": "If faced with public harassment: 1. Raise your voice to attract attention. 2. Move to a Safe Spot (Pink Booth, Police). 3. Report the incident on this app.",
    "alone": "Walking alone? 1. Stay on well-lit main roads. 2. Keep your phone in hand. 3. Use the 'Route Finder' to get the safest path.",
    "sos": "Press the red SOS button on your screen immediately to alert your contacts!"
};

const VoiceChatbot: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([
        { text: "Hi! I'm your Safety Assistant. Ask me how to handle any situation.", sender: 'bot' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [inputText, setInputText] = useState("");

    // Speech Recognition Setup
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            // @ts-ignore
            const speech = new window.webkitSpeechRecognition();
            speech.continuous = false;
            speech.lang = 'en-US';
            speech.interimResults = false;

            speech.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleUserMessage(transcript);
                setIsListening(false);
            };

            speech.onerror = () => setIsListening(false);
            speech.onend = () => setIsListening(false);

            recognitionRef.current = speech;
        }
    }, []);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1.1; // Slightly female/friendly pitch
        window.speechSynthesis.speak(utterance);
    };

    const handleUserMessage = (text: string) => {
        setMessages(prev => [...prev, { text, sender: 'user' }]);

        let response = QA_DB['default'];
        const lower = text.toLowerCase();

        // Simple Keyword Matching
        for (const key in QA_DB) {
            if (lower.includes(key) && key !== 'default') {
                response = QA_DB[key];
                break;
            }
        }

        setTimeout(() => {
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
            speak(response);
        }, 600);
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSend = () => {
        if (inputText.trim()) {
            handleUserMessage(inputText);
            setInputText("");
        }
    };

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'fixed',
                    bottom: '90px', // Above Navigation
                    left: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'white',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {open ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Interface */}
            {open && (
                <div className="glass-panel animate-enter" style={{
                    position: 'fixed',
                    bottom: '150px',
                    left: '20px',
                    width: '300px',
                    height: '400px',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Header */}
                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--accent)', padding: '6px', borderRadius: '50%' }}>
                            <Volume2 size={16} color="white" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Safety Assistant</h4>
                    </div>

                    {/* Chat Area */}
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                maxWidth: '80%',
                                fontSize: '0.85rem',
                                borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '10px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={toggleMic}
                            style={{ background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="Type or speak..."
                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceChatbot;
