import React, { useEffect, useState } from 'react';
import { getModelStatus } from './LearningSystem';
import { Brain, RefreshCw, TrendingUp } from 'lucide-react';

const AIStatusWidget: React.FC = () => {
    const [status, setStatus] = useState(getModelStatus());

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(getModelStatus());
        }, 30000); // Update "live" every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain color="var(--primary)" />
                    AI System Status
                </h3>
                <span className="badge" style={{ background: 'var(--success)', color: '#fff' }}>Online</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Model Accuracy</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{status.accuracy}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} /> {status.improvement}
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Data Processed</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{status.dataPointsProcessed.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                        Last retrain: {status.lastRetrain}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
                <RefreshCw size={16} className="spin" />
                Continuous Learning Module active. Updating weights based on recent reports.
            </div>
            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AIStatusWidget;
