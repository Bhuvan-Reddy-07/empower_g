import React, { useState, useEffect } from 'react';
import { Navigation, Shield, Clock, MapPin, Search } from 'lucide-react';
import RouteInstructions from './RouteInstructions';

interface LocationResult {
    display_name: string;
    lat: string;
    lon: string;
}

interface RouteOption {
    path: any[]; // Array of nodes or coords
    distance: number;
    time: number;
    safetyScore: number;
    type: string;
}

// Helper: Haversine distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const RouteFinder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startLoc, setStartLoc] = useState<LocationResult | null>(null);
    const [endLoc, setEndLoc] = useState<LocationResult | null>(null);

    const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
    const [activeField, setActiveField] = useState<'START' | 'END' | null>(null);

    const [routes, setRoutes] = useState<any>(null);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Debounced Search
    useEffect(() => {
        const query = activeField === 'START' ? startQuery : endQuery;
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // Search specifically in India
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Search failed", err);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [startQuery, endQuery, activeField]);

    const handleSelect = (loc: LocationResult) => {
        if (activeField === 'START') {
            setStartLoc(loc);
            setStartQuery(loc.display_name.split(',')[0]); // Keep short name in input
        } else {
            setEndLoc(loc);
            setEndQuery(loc.display_name.split(',')[0]);
        }
        setSuggestions([]);
        setActiveField(null);
    };

    const handleSearch = () => {
        if (!startLoc || !endLoc) {
            alert("Please select both locations from the suggestions.");
            return;
        }
        setLoading(true);

        // Simulate Route Calculation based on real distance
        setTimeout(() => {
            const dist = getDistance(
                parseFloat(startLoc.lat), parseFloat(startLoc.lon),
                parseFloat(endLoc.lat), parseFloat(endLoc.lon)
            );

            // Assume 30km/h avg speed in city
            const baseTime = Math.round((dist / 30) * 60);

            setRoutes({
                safest: {
                    distance: (dist * 1.2).toFixed(1),
                    time: Math.round(baseTime * 1.3), // Slower
                    safetyScore: 94,
                    type: 'Safest',
                    instructions: [`Start at ${startQuery}`, `Head towards ${endQuery}`, `Avoid high-risk zones`, `Arrive at destination`]
                },
                fastest: {
                    distance: dist.toFixed(1),
                    time: baseTime,
                    safetyScore: 65, // Risky
                    type: 'Fastest',
                    instructions: [`Start at ${startQuery}`, `Take direct highway`, `Caution: Crowded area`, `Arrive at destination`]
                }
            });
            setLoading(false);
            setSelectedRoute(null);
        }, 1500);
    };

    return (
        <>
            <div className="glass-panel animate-enter" style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                right: '20px',
                padding: '20px',
                zIndex: 999,
                maxHeight: '70vh',
                overflowY: 'visible', // Allow dropdown overflow
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{ margin: '0 0 15px', display: 'flex', justifyContent: 'space-between' }}>
                    Find Safe Route (Pan-India)
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>&times;</button>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>

                    {/* Start Input */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} color="var(--success)" /> Start Location
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search city, area, or landmark..."
                            value={startQuery}
                            onChange={(e) => { setStartQuery(e.target.value); setActiveField('START'); }}
                            onFocus={() => setActiveField('START')}
                        />
                        {activeField === 'START' && suggestions.length > 0 && (
                            <div className="glass-panel" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1001,
                                background: 'rgba(30, 41, 59, 0.95)', padding: '5px', maxHeight: '200px', overflowY: 'auto'
                            }}>
                                {suggestions.map((s, i) => (
                                    <div key={i} onClick={() => handleSelect(s)} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                        {s.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* End Input */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} color="var(--danger)" /> Destination
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search destination..."
                            value={endQuery}
                            onChange={(e) => { setEndQuery(e.target.value); setActiveField('END'); }}
                            onFocus={() => setActiveField('END')}
                        />
                        {activeField === 'END' && suggestions.length > 0 && (
                            <div className="glass-panel" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1001,
                                background: 'rgba(30, 41, 59, 0.95)', padding: '5px', maxHeight: '200px', overflowY: 'auto'
                            }}>
                                {suggestions.map((s, i) => (
                                    <div key={i} onClick={() => handleSelect(s)} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                        {s.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="btn-primary" onClick={handleSearch} disabled={loading}>
                        {loading ? 'Calculating Best Route...' : 'Find Safe Routes'}
                    </button>
                </div>

                {routes && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                        {/* Safest Card */}
                        <div
                            onClick={() => setSelectedRoute(routes.safest)}
                            style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid var(--success)',
                                borderRadius: '12px',
                                padding: '15px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>Safest Route</strong>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Recommended</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{routes.safest.time} min</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{routes.safest.safetyScore}% Safe</div>
                                </div>
                            </div>
                        </div>

                        {/* Fastest Card */}
                        <div
                            onClick={() => setSelectedRoute(routes.fastest)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--danger)',
                                borderRadius: '12px',
                                padding: '15px',
                                cursor: 'pointer',
                                opacity: 0.9
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>Fastest Route</strong>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Higher Risk</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{routes.fastest.time} min</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{routes.fastest.safetyScore}% Safe</div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {selectedRoute && (
                <RouteInstructions
                    route={selectedRoute}
                    onClose={() => setSelectedRoute(null)}
                />
            )}
        </>
    );
};

export default RouteFinder;
