import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

type GameType = null | 'memory' | 'clicker' | 'reaction' | 'snake';

const GamesSection: React.FC = () => {
  const { currentUser, setUsers } = useApp();
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const addCoins = (amount: number) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u =>
      u.id === currentUser.id ? { ...u, coins: u.coins + amount } : u
    ));
  };

  if (activeGame === 'clicker') return <ClickerGame onBack={() => setActiveGame(null)} addCoins={addCoins} />;
  if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame(null)} addCoins={addCoins} />;
  if (activeGame === 'reaction') return <ReactionGame onBack={() => setActiveGame(null)} addCoins={addCoins} />;
  if (activeGame === 'snake') return <SnakeGame onBack={() => setActiveGame(null)} addCoins={addCoins} />;

  const games = [
    { id: 'clicker', name: 'Кликер', icon: '👾', desc: 'Кликай и зарабатывай монетки', reward: '+1 за клик' },
    { id: 'memory', name: 'Память', icon: '🧠', desc: 'Запомни последовательность', reward: '+10 за победу' },
    { id: 'reaction', name: 'Реакция', icon: '⚡', desc: 'Нажми в нужный момент', reward: '+5 за попадание' },
    { id: 'snake', name: 'Змейка', icon: '🐍', desc: 'Классическая змейка', reward: '+1 за еду' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>
          ⚡ МИНИ-ИГРЫ
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.6)', fontFamily: 'Rajdhani, sans-serif' }}>
          Играй и зарабатывай монетки для магазина
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {games.map(game => (
          <div
            key={game.id}
            className="game-card rounded-2xl p-5"
            onClick={() => setActiveGame(game.id as GameType)}
          >
            <div className="text-4xl mb-3">{game.icon}</div>
            <h3 className="font-bold text-white text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{game.name}</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{game.desc}</p>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs" style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              color: '#ffd700',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
            }}>
              🪙 {game.reward}
            </div>
          </div>
        ))}
      </div>

      {currentUser && (
        <div className="mt-6 rounded-xl px-5 py-4" style={{
          background: 'rgba(255,215,0,0.05)',
          border: '1px solid rgba(255,215,0,0.2)',
        }}>
          <p className="text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(255,255,255,0.7)' }}>
            Твои монетки: <span style={{ color: '#ffd700', fontWeight: 700, fontSize: '18px' }}>🪙 {currentUser.coins}</span>
          </p>
        </div>
      )}
    </div>
  );
};

/* ---- CLICKER ---- */
const ClickerGame: React.FC<{ onBack: () => void; addCoins: (n: number) => void }> = ({ onBack, addCoins }) => {
  const { currentUser } = useApp();
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClicks(c => c + 1);
    addCoins(1);
    const id = Date.now();
    setParticles(p => [...p, { id, x, y }]);
    setTimeout(() => setParticles(p => p.filter(p => p.id !== id)), 800);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="flex items-center gap-3 w-full mb-6">
        <button onClick={onBack} className="neon-btn px-4 py-2 rounded-lg text-sm">← НАЗАД</button>
        <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>👾 КЛИКЕР</h2>
      </div>
      <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Кликов: {clicks} | Монетки: 🪙 {currentUser?.coins}</p>
      <div className="relative mt-6" onClick={handleClick}>
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center text-7xl cursor-pointer select-none transition-transform active:scale-95"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.4), rgba(0,229,255,0.2))',
            border: '2px solid rgba(168,85,247,0.6)',
            boxShadow: '0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.1)',
          }}
        >
          👾
        </div>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute pointer-events-none font-bold animate-fade-in"
            style={{ left: p.x, top: p.y, color: '#ffd700', fontSize: '20px', animation: 'slide-up 0.8s ease-out forwards', fontFamily: 'Orbitron, monospace' }}
          >
            +1
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs" style={{ color: 'rgba(0,229,255,0.5)', fontFamily: 'Rajdhani, sans-serif' }}>ЖМИ НА ПРИШЕЛЬЦА!</p>
    </div>
  );
};

/* ---- MEMORY ---- */
const MemoryGame: React.FC<{ onBack: () => void; addCoins: (n: number) => void }> = ({ onBack, addCoins }) => {
  const EMOJIS = ['🔥','💎','⚡','🌙','🎮','🦊','🌈','💜'];
  const [cards, setCards] = useState(() => {
    const arr = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    return arr;
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [won, setWon] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const flip = (id: number) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newSel = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setSelected(newSel);
    if (newSel.length === 2) {
      const [a, b] = newSel.map(sid => cards.find(c => c.id === sid)!);
      setTimeout(() => {
        if (a.emoji === b.emoji) {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c));
          const allMatched = cards.filter(c => !c.matched).length === 2;
          if (allMatched) {
            setWon(true);
            if (!rewarded) { addCoins(10); setRewarded(true); }
          }
        } else {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c));
        }
        setSelected([]);
      }, 800);
    }
  };

  useEffect(() => {
    const allMatched = cards.every(c => c.matched);
    if (allMatched && !won) {
      setWon(true);
      if (!rewarded) { addCoins(10); setRewarded(true); }
    }
  }, [cards]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="neon-btn px-4 py-2 rounded-lg text-sm">← НАЗАД</button>
        <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>🧠 ПАМЯТЬ</h2>
      </div>
      {won && (
        <div className="mb-4 rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.4)', color: '#00ff88' }}>
          🎉 Победа! +10 монеток!
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => flip(card.id)}
            className="w-full aspect-square rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-300"
            style={{
              background: card.flipped || card.matched
                ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,229,255,0.2))'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${card.matched ? 'rgba(0,255,136,0.5)' : card.flipped ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: card.flipped ? '0 0 15px rgba(168,85,247,0.3)' : 'none',
              transform: card.flipped ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {card.flipped || card.matched ? card.emoji : '❓'}
          </div>
        ))}
      </div>
    </div>
  );
};

const useEffect = React.useEffect;

/* ---- REACTION ---- */
const ReactionGame: React.FC<{ onBack: () => void; addCoins: (n: number) => void }> = ({ onBack, addCoins }) => {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const spawnTarget = () => {
    setPos({ x: 10 + Math.random() * 70, y: 10 + Math.random() * 70 });
    setActive(true);
    setTimeout(() => setActive(false), 1200);
  };

  const startGame = () => {
    setWaiting(true);
    setScore(0);
    let count = 0;
    const run = () => {
      spawnTarget();
      count++;
      if (count < 10) setTimeout(run, 1500 + Math.random() * 1000);
      else setWaiting(false);
    };
    setTimeout(run, 500);
  };

  const hit = () => {
    if (!active) return;
    setActive(false);
    setScore(s => s + 1);
    addCoins(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="neon-btn px-4 py-2 rounded-lg text-sm">← НАЗАД</button>
        <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>⚡ РЕАКЦИЯ</h2>
        <span className="ml-auto font-bold" style={{ color: '#ffd700' }}>🪙 {score}</span>
      </div>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: '300px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.3)' }}
      >
        {active && (
          <div
            onClick={hit}
            className="absolute w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-pointer animate-fade-in"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              background: 'radial-gradient(circle, rgba(255,215,0,0.4), rgba(168,85,247,0.3))',
              border: '2px solid #ffd700',
              boxShadow: '0 0 20px rgba(255,215,0,0.5)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            ⚡
          </div>
        )}
        {!waiting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold mb-4" style={{ color: '#ffd700' }}>Счёт: {score}</p>
            <button onClick={startGame} className="neon-btn px-6 py-3 rounded-xl">ИГРАТЬ</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- SNAKE ---- */
const SnakeGame: React.FC<{ onBack: () => void; addCoins: (n: number) => void }> = ({ onBack, addCoins }) => {
  const GRID = 15;
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState({ x: 3, y: 3 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const dirRef = React.useRef(dir);
  dirRef.current = dir;

  const placeFood = (snk: typeof snake) => {
    let pos: { x: number; y: number };
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (snk.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  };

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: (prev[0].x + dirRef.current.x + GRID) % GRID, y: (prev[0].y + dirRef.current.y + GRID) % GRID };
        if (prev.some(s => s.x === head.x && s.y === head.y)) {
          setRunning(false); setDead(true); return prev;
        }
        const ateFood = head.x === food.x && head.y === food.y;
        const next = ateFood ? [head, ...prev] : [head, ...prev.slice(0, -1)];
        if (ateFood) {
          setScore(s => s + 1); addCoins(1); setFood(placeFood(next));
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [running, food]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown') setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft') setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight') setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = () => {
    setSnake([{ x: 7, y: 7 }]); setDir({ x: 1, y: 0 }); setScore(0);
    setFood({ x: 3, y: 3 }); setDead(false); setRunning(true);
  };

  const cells = GRID * GRID;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="neon-btn px-4 py-2 rounded-lg text-sm">← НАЗАД</button>
        <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>🐍 ЗМЕЙКА</h2>
        <span className="ml-auto font-bold" style={{ color: '#ffd700' }}>🪙 {score}</span>
      </div>
      <div className="inline-grid rounded-xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: '1px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
        {Array.from({ length: cells }, (_, i) => {
          const x = i % GRID; const y = Math.floor(i / GRID);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className="w-5 h-5 flex items-center justify-center"
              style={{
                background: isHead ? 'var(--neon-purple)' : isBody ? 'rgba(168,85,247,0.4)' : 'rgba(0,0,0,0.4)',
                fontSize: '12px',
              }}
            >
              {isFood ? '🍎' : ''}
            </div>
          );
        })}
      </div>
      {(!running || dead) && (
        <div className="mt-4 text-center">
          {dead && <p className="mb-2" style={{ color: '#ff5555' }}>💀 Игра окончена! Счёт: {score}</p>}
          <button onClick={start} className="neon-btn px-6 py-3 rounded-xl">
            {dead ? 'ЗАНОВО' : 'ИГРАТЬ'}
          </button>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Управление: стрелки</p>
        </div>
      )}
    </div>
  );
};

export default GamesSection;
