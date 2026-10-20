import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/index.css';

const Login: React.FC = () => {
    const { signInWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, user } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                await registerWithEmail(email, password, name);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'radial-gradient(circle at top right, #6366f1 0%, transparent 40%), radial-gradient(circle at bottom left, #ec4899 0%, transparent 40%)'
        }}>
            <div className="glass-panel animate-enter" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>EMPOWER_G</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Safety in your hands</p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="input-field"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input-field"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        {isSignUp ? 'Create Account' : 'Login'}
                    </button>
                </form>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                    OR
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', background: '#fff', color: '#333' }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '20px', height: '20px' }} />
                    Sign in with Google
                </button>

                <button
                    onClick={loginAsGuest}
                    type="button"
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    Continue as Guest (Demo Mode) 🚀
                </button>
            </div>
        </div>
    );
};

export default Login;
