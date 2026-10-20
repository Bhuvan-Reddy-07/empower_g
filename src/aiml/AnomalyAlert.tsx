import React, { useEffect, useState } from 'react';
import { detectAnomalies, Anomaly } from './AnomalyDetector';
import { AlertTriangle, X } from 'lucide-react';

const AnomalyAlert: React.FC = () => {
    const [alert, setAlert] = useState<Anomaly | null>(null);

    useEffect(() => {
        // Poll for anomalies every 10 seconds (Simulated real-time)
        const interval = setInterval(() => {
            const anomaly = detectAnomalies();
            if (anomaly) {
                setAlert(anomaly);
                // Auto-dismiss after 8 seconds
                setTimeout(() => setAlert(null), 8000);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    if (!alert) return null;

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            width: '90%',
            maxWidth: '400px',
            background: 'rgba(220, 38, 38, 0.95)', // Red alert
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            padding: '16px',
            animation: 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                <AlertTriangle color="#fff" size={24} />
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1rem' }}>Anomaly Detected!</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                    {alert.description}
                </p>
                <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>
                        Confidence: {alert.confidence}%
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>
                        Type: {alert.type}
                    </span>
                </div>
            </div>
            <button
                onClick={() => setAlert(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0' }}
            >
                <X size={20} />
            </button>
            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AnomalyAlert;
