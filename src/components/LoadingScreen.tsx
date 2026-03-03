import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onDone: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ['Инициализация...', 'Загрузка данных...', 'Подключение к серверу...', 'Запуск LiMark...'];

  useEffect(() => {
    const duration = 6000;
    const interval = 50;
    const step = 100 / (duration / interval);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      setProgress(Math.min(current, 100));
      setPhase(Math.floor((current / 100) * (phases.length - 1)));
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(onDone, 400);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center cyber-grid" style={{ background: 'var(--bg-dark)', zIndex: 9999 }}>
      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-full h-[2px] opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
            animation: 'scan-line 3s linear infinite',
          }}
        />
      </div>

      {/* Corner decorations */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-8 h-8`}>
          <div className="absolute top-0 left-0 w-4 h-[2px]" style={{ background: 'var(--neon-purple)' }} />
          <div className="absolute top-0 left-0 w-[2px] h-4" style={{ background: 'var(--neon-purple)' }} />
        </div>
      ))}

      {/* Logo */}
      <div className="relative mb-12 animate-float">
        <div
          className="absolute inset-0 blur-3xl opacity-30 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--neon-purple), var(--neon-cyan))' }}
        />
        <h1
          className="relative text-7xl font-black tracking-widest"
          style={{
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(135deg, #a855f7, #00e5ff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.8))',
          }}
        >
          LiMark
        </h1>
        <p
          className="text-center text-xs tracking-[0.4em] mt-2"
          style={{ color: 'rgba(0,229,255,0.7)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
        >
          Messenger v1.0
        </p>
      </div>

      {/* Dots */}
      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-dot-bounce"
            style={{
              background: i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-cyan)',
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-cyan)'}`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 mb-4">
        <div
          className="w-full h-[2px] rounded-full"
          style={{ background: 'rgba(168,85,247,0.2)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-cyan))',
              boxShadow: '0 0 10px var(--neon-purple)',
            }}
          />
        </div>
      </div>

      {/* Phase text */}
      <p
        className="text-sm tracking-widest animate-neon-pulse"
        style={{ color: 'rgba(168,85,247,0.8)', fontFamily: 'Rajdhani, sans-serif' }}
      >
        {phases[Math.min(phase, phases.length - 1)]}
      </p>

      {/* Progress percent */}
      <p
        className="mt-2 text-xs"
        style={{ color: 'rgba(0,229,255,0.5)', fontFamily: 'Rajdhani, sans-serif' }}
      >
        {Math.floor(progress)}%
      </p>
    </div>
  );
};

export default LoadingScreen;
