import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

const AuthScreen: React.FC = () => {
  const { login, registerUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = mode === 'login'
      ? login(username, password)
      : registerUser(username, password);
    if (err) setError(err);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center cyber-grid" style={{ background: 'var(--bg-dark)' }}>
      {/* Ambient glows */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'var(--neon-purple)' }} />
      <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'var(--neon-cyan)' }} />

      <div className="relative w-full max-w-sm mx-4 animate-slide-up">
        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(168,85,247,0.4)',
          boxShadow: '0 0 40px rgba(168,85,247,0.15), 0 0 80px rgba(168,85,247,0.05)',
        }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-black tracking-widest mb-1"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'linear-gradient(135deg, #a855f7, #00e5ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.6))',
              }}
            >
              LiMark
            </h1>
            <p style={{ color: 'rgba(0,229,255,0.6)', fontSize: '11px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.3em' }}>
              {mode === 'login' ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.04)', padding: '4px' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-md text-sm font-semibold transition-all"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  letterSpacing: '0.05em',
                  background: mode === m ? 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(0,229,255,0.2))' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                  border: mode === m ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                  boxShadow: mode === m ? '0 0 15px rgba(168,85,247,0.2)' : 'none',
                }}
              >
                {m === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(168,85,247,0.8)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
                НИКНЕЙМ
              </label>
              <input
                className="input-neon w-full px-4 py-3 rounded-lg text-sm"
                placeholder="Введи никнейм..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(168,85,247,0.8)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
                ПАРОЛЬ
              </label>
              <input
                type="password"
                className="input-neon w-full px-4 py-3 rounded-lg text-sm"
                placeholder="Введи пароль..."
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm animate-fade-in" style={{
                background: 'rgba(255,50,50,0.1)',
                border: '1px solid rgba(255,50,50,0.3)',
                color: '#ff6666',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="neon-btn w-full py-3 rounded-lg text-sm mt-2"
            >
              {mode === 'login' ? '⚡ ВОЙТИ' : '🚀 СОЗДАТЬ АККАУНТ'}
            </button>
          </form>
        </div>

        {/* Bottom hint */}
        <p className="text-center mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Rajdhani, sans-serif' }}>
          LiMark Messenger — следующее поколение общения
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
