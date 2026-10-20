import React, { useState, useEffect } from 'react';
import { Shield, Bell, X, Check } from 'lucide-react';

const CommunitySOS: React.FC = () => {
    const [broadcasting, setBroadcasting] = useState(false);
    const [helpStatus, setHelpStatus] = useState<'IDLE' | 'SENDING' | 'ACCEPTED'>('IDLE');
    const [incomingAlert, setIncomingAlert] = useState<{ name: string, dist: string } | null>(null);

    // Simulate Receiving an Alert from another user (Demo Trigger)
    useEffect(() => {
        // Randomly simulate an incoming request every 60-90 seconds for demo effects
        // Or triggered by a hidden debug sequence. Let's do a timer for now but long duration.
        const timer = setTimeout(() => {
            setIncomingAlert({ name: 'Priya S.', dist: '0.4km' });
        }, 15000); // 15s after load for demo
        return () => clearTimeout(timer);
    }, []);

    const handleBroadcast = () => {
        setBroadcasting(true);
        setHelpStatus('SENDING');

        // Simulate network delay and finding a peer
        setTimeout(() => {
            setHelpStatus('ACCEPTED');
            // Auto dismiss "Accepted" state after 5s
            setTimeout(() => {
                setBroadcasting(false);
                setHelpStatus('IDLE');
            }, 5000);
        }, 3000);
    };

    return (
        <>
            {/* 1. Shield Button (Sender UI) */}
            <button
                onClick={handleBroadcast}
                className={broadcasting ? "pulse-ring" : ""}
                style={{
                    position: 'absolute',
                    bottom: '250px', // Placed ABOVE Share Location (180px)
                    right: '25px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    background: broadcasting ? 'white' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: broadcasting ? '#6366f1' : 'white',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <Shield size={28} fill={broadcasting ? "#6366f1" : "none"} />
            </button>

            {/* 2. Sender Feedback Modal */}
            {broadcasting && (
                <div className="glass-panel animate-enter" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2000,
                    padding: '25px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    width: '280px',
                    background: 'rgba(255, 255, 255, 0.95)'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        {helpStatus === 'SENDING' ? (
                            <div className="ripple-loader"></div>
                        ) : (
                            <div style={{ background: 'var(--success)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                <Check color="white" size={32} />
                            </div>
                        )}
                    </div>

                    <h3 style={{ margin: '0 0 10px', color: '#1f2937' }}>
                        {helpStatus === 'SENDING' ? 'Contacting Nearby Peers...' : 'Help Accepted!'}
                    </h3>

                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#4b5563' }}>
                        {helpStatus === 'SENDING'
                            ? 'Broadcasting your location to verified users within 1km.'
                            : 'Volunteer "Ravi K." is 2 mins away and coming to help.'}
                    </p>

                    {helpStatus === 'SENDING' && (
                        <button
                            onClick={() => { setBroadcasting(false); setHelpStatus('IDLE'); }}
                            style={{ marginTop: '20px', background: 'none', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}

            {/* 3. Receiver Alert Modal (Incoming) */}
            {incomingAlert && (
                <div className="glass-panel animate-enter" style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2100, // Topmost
                    width: '90%',
                    maxWidth: '400px',
                    background: '#fff',
                    borderLeft: '5px solid var(--warning)',
                    padding: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '15px'
                }}>
                    <div style={{ background: 'var(--warning)', padding: '10px', borderRadius: '50%', color: 'white' }}>
                        <Bell className="shake" size={24} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px', color: '#1f2937' }}>Community Alert</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                            <strong>{incomingAlert.name}</strong> near you ({incomingAlert.dist}) is requesting assistance!
                        </p>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button style={{
                                flex: 1,
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                I'm Going
                            </button>
                            <button
                                onClick={() => setIncomingAlert(null)}
                                style={{
                                    flex: 1,
                                    background: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Ignore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .pulse-ring {
                    animation: pulse-ring 2s infinite;
                }
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .ripple-loader {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--primary);
                    opacity: 0.6;
                    margin: 0 auto;
                    animation: scaleOut 1s infinite ease-in-out;
                }
                @keyframes scaleOut {
                    0% { transform: scale(0); }
                    100% { transform: scale(1.0); opacity: 0; }
                }
            `}</style>
        </>
    );
};

export default CommunitySOS;
