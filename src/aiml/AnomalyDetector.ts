
// Mock Anomaly Detection System

export interface Anomaly {
    id: string;
    type: 'STALKING' | 'MOB' | 'LOITERING';
    confidence: number;
    description: string;
    timestamp: Date;
}

export const detectAnomalies = (): Anomaly | null => {
    // Simulate random detection every few intervals
    const roll = Math.random();

    if (roll < 0.3) {
        return {
            id: Date.now().toString(),
            type: 'LOITERING',
            confidence: 94,
            description: 'Suspicious individual detected at same location for >45 mins.',
            timestamp: new Date()
        };
    }

    if (roll > 0.9) {
        return {
            id: Date.now().toString(),
            type: 'MOB',
            confidence: 88,
            description: 'Unusual gathering of 15+ people detected in low-traffic zone.',
            timestamp: new Date()
        };
    }

    return null;
};
