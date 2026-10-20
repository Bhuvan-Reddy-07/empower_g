
// Mock AI Engine for Safety Analysis

export interface RiskFactors {
    time: number; // 0-23 hours
    weather: 'clear' | 'rainy' | 'foggy';
    crowdDensity: 'high' | 'medium' | 'low';
    policePresence: boolean;
    incidentHistoryCount: number;
}

export const calculateRiskScore = (factors: RiskFactors): number => {
    // 1. Base Scores
    let score = 0;

    // Time Factor (Late night is riskier)
    if (factors.time >= 22 || factors.time <= 4) score += 25; // Late night
    else if (factors.time >= 19 || factors.time <= 21) score += 15; // Evening
    else score += 5; // Day

    // Weather Factor (Rain/Fog reduces visibility)
    if (factors.weather === 'rainy') score += 20;
    else if (factors.weather === 'foggy') score += 15;

    // Crowd Factor (Isolation is risky)
    if (factors.crowdDensity === 'low') score += 25;
    else if (factors.crowdDensity === 'medium') score += 10;
    else score -= 10; // High crowd is safer

    // Incident History (Past predicting future)
    if (factors.incidentHistoryCount > 10) score += 30;
    else if (factors.incidentHistoryCount > 5) score += 15;

    // Police Presence (Mitigator)
    if (factors.policePresence) score -= 30;

    // Clamp score 0-100
    return Math.min(Math.max(score, 1), 99);
};

export const predictHotspot = (locationName: string): string => {
    // Simulated Prediction
    const traffic = Math.random() > 0.5 ? 'High' : 'Low';
    if (locationName.includes("Station") || locationName.includes("Market")) {
        return `High Risk predicted at 20:00 (85% confidence)`;
    }
    return `Low Risk predicted (Safe Zone)`;
};
