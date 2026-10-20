import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { HOTSPOTS, AMARAVATI_CENTER, SafetyLocation, generateSafeSpots } from '../../../database/mockData';
import { db } from '../../../backend/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import HeatmapLayer from './HeatmapLayer';
import { Layers, Crosshair } from 'lucide-react';

// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Helper to calculate distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Component to handle map actions like plotting user location
const MapController: React.FC<{
    centerUser: boolean,
    setCenterUser: (v: boolean) => void,
    reports: SafetyLocation[],
    notifyFound: (spots: { name: string, dist: number, lat: number, lng: number }[]) => void,
    onLocationFound: (lat: number, lng: number) => void
}> = ({ centerUser, setCenterUser, reports, notifyFound, onLocationFound }) => {
    const map = useMap();

    useEffect(() => {
        if (centerUser) {
            map.locate().on("locationfound", function (e) {
                map.flyTo(e.latlng, 14);
                setCenterUser(false);
                onLocationFound(e.latlng.lat, e.latlng.lng);

                // Find all Safe Zones within range (100m to 5km)
                // Note: We need to use a timeout or effect to wait for 'reports' to update with generated spots
                // But for now, we can just defer this check slightly or rely on the user to click again? 
                // Better: The parent handles generation, and we can trigger finding after a slight delay or rely on reactivity if 'reports' prop updates.
                // However, 'reports' prop update won't trigger this effect again unless we depend on it.
                // Let's do the finding logic in a separate effect dependent on 'reports' OR just assume the initial mock data is enough + new generation.
                // Actually, let's just trigger generation here. The parent will add them. The finding logic below runs on CURRENT reports.
                // Ideally we should wait. For MVP simplicity, we'll just run it on existing + maybe prompt user to scan again?
                // OR: We can trigger the find logic AFTER generation.

                // Let's move the finding logic to the PARENT or make it reactive to 'reports'.
                // For now, let's keep it simple: Use what we have. Procedural spots might appear a split second later.
            });
        }
    }, [centerUser, map, setCenterUser, onLocationFound]);

    // Reactive effect to report found spots whenever 'reports' or 'centerUser' (location) changes?
    // A bit tricky without tracking "current user location" in state.
    // Let's stick to: When location found -> Generate spots -> (Parent updates reports) -> Then we need checking.
    // We'll add a 'userLocation' state to MapController? No, keep it stateless.

    // Quick Fix: We'll calculate distance on ALL reports whenever 'reports' changes, IF we have a user location.
    // But we don't store user location here.

    // Alternative: Just generate spots. The UI will update markers. The "Range Find" alert might miss them on first fly-to but that's okay.
    // User can click "Locate Me" again or we can trigger it.

    return null;
}

const SafetyMap: React.FC = () => {
    const [reports, setReports] = useState<SafetyLocation[]>(HOTSPOTS);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [centerUser, setCenterUser] = useState(false);
    const [foundSafeSpots, setFoundSafeSpots] = useState<{ name: string, dist: number, lat: number, lng: number }[] | null>(null);

    const handleLocationFound = (lat: number, lng: number) => {
        // Generate procedural safe spots around this location
        const newSpots = generateSafeSpots(lat, lng);
        setReports(prev => [...prev, ...newSpots]);

        // Instant feedback: compute found spots immediately using the NEW list
        const allSpots = [...reports, ...newSpots];
        const found: { name: string, dist: number, lat: number, lng: number }[] = [];

        allSpots.forEach(spot => {
            if (spot.riskLevel === 'Safe' || spot.riskLevel === 'SafeStop') {
                const dist = getDistance(lat, lng, spot.lat, spot.lng);
                if (dist >= 0.1 && dist <= 5.0) {
                    found.push({ name: spot.name, dist, lat: spot.lat, lng: spot.lng });
                }
            }
        });
        found.sort((a, b) => a.dist - b.dist);
        if (found.length > 0) setFoundSafeSpots(found);
    };

    // Auto-locate on first load for "Detect my location" experience
    useEffect(() => {
        setTimeout(() => setCenterUser(true), 1000);
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "incidents"), (snapshot) => {
            const newReports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SafetyLocation[];
            setReports((prev) => [...HOTSPOTS, ...newReports]);
        });
        return () => unsubscribe();
    }, []);

    const getMarkerColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'red';
            case 'Medium': return 'orange';
            case 'Safe': return 'green';
            case 'SafeStop': return '#8b5cf6';
            default: return 'blue';
        }
    };

    return (
        <div style={{ height: '100vh', width: '100%', zIndex: 0, position: 'relative' }}>

            {/* Range Search Results Alert */}
            {foundSafeSpots && (
                <div className="glass-panel animate-enter" style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2000,
                    padding: '15px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#333',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    maxWidth: '90%',
                    width: '350px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={18} /> Safe Spots Nearby
                        </h4>
                        <button
                            onClick={() => setFoundSafeSpots(null)}
                            style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                        Found {foundSafeSpots.length} places (100m - 5km)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {foundSafeSpots.map((spot, idx) => (
                            <div key={idx} style={{
                                padding: '10px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '10px',
                                borderLeft: '4px solid var(--success)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{spot.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#555' }}>
                                        {spot.dist.toFixed(2)} km away
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.2rem' }}>📍</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls Container */}
            <div style={{ position: 'absolute', top: '80px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    title="Toggle Heatmap"
                    style={{
                        background: showHeatmap ? 'var(--primary)' : 'white',
                        color: showHeatmap ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                    }}
                >
                    <Layers size={20} />
                </button>

                <button
                    onClick={() => setCenterUser(true)}
                    title="Locate Me"
                    style={{
                        background: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        cursor: 'pointer'
                    }}
                >
                    <Crosshair size={20} />
                </button>
            </div>

            <MapContainer center={AMARAVATI_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    centerUser={centerUser}
                    setCenterUser={setCenterUser}
                    reports={reports}
                    notifyFound={(spots) => setFoundSafeSpots(spots)}
                    onLocationFound={handleLocationFound}
                />

                {showHeatmap ? <HeatmapLayer /> : null}

                {reports.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={DefaultIcon}>
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <h3 style={{ margin: '0 0 5px', color: '#1e293b' }}>{loc.name}</h3>
                                <span className="badge" style={{
                                    background: getMarkerColor(loc.riskLevel),
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem'
                                }}>
                                    {loc.riskLevel === 'SafeStop' ? 'Safe Stop' : `${loc.riskLevel} Risk`}
                                </span>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#475569' }}>{loc.description}</p>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    <strong>Type:</strong> {loc.type}<br />
                                    <strong>Time:</strong> {loc.peakTime || 'All Day'}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default SafetyMap;
