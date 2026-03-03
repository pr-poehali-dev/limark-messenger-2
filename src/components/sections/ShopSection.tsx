import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

const STICKER_PACKS = [
  {
    id: 'gaming',
    name: 'Геймерский набор',
    price: 50,
    preview: ['🎮','👾','🕹️','🏆','⚡'],
    stickers: ['🎮','👾','🕹️','🏆','⚡','💀','🔥','💎','🌀','🎯'],
    rarity: 'common',
  },
  {
    id: 'space',
    name: 'Космос',
    price: 75,
    preview: ['🚀','🌙','⭐','🌌','🛸'],
    stickers: ['🚀','🌙','⭐','🌌','🛸','🪐','☄️','👨‍🚀','🌟','💫'],
    rarity: 'rare',
  },
  {
    id: 'animals',
    name: 'Животные',
    price: 60,
    preview: ['🦊','🐺','🐉','🦋','🦁'],
    stickers: ['🦊','🐺','🐉','🦋','🦁','🐯','🦄','🐺','🦅','🦉'],
    rarity: 'common',
  },
  {
    id: 'neon',
    name: 'Неон Пак',
    price: 100,
    preview: ['💜','💙','🔮','🌈','✨'],
    stickers: ['💜','💙','🔮','🌈','✨','🎆','🎇','💥','🌊','🔥'],
    rarity: 'epic',
  },
  {
    id: 'flowers_limited',
    name: '🌸 Цветочный лимитед',
    price: 200,
    preview: ['🌹','🌺','🌷','🌸','🪻'],
    stickers: ['🌹','🌺','🏵','🌷','🌸','🪻'],
    rarity: 'limited',
  },
  {
    id: 'cute',
    name: 'Милашки',
    price: 80,
    preview: ['🐱','🐶','🐻','🐼','🐨'],
    stickers: ['🐱','🐶','🐻','🐼','🐨','🐰','🐸','🐹','🐯','🦊'],
    rarity: 'common',
  },
];

const rarityColor: Record<string, string> = {
  common: 'rgba(255,255,255,0.6)',
  rare: '#00e5ff',
  epic: '#a855f7',
  limited: '#ffd700',
};

const rarityLabel: Record<string, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпик',
  limited: '🌟 Лимитед',
};

const ShopSection: React.FC = () => {
  const { currentUser, setUsers } = useApp();
  const [notification, setNotification] = useState('');

  const owned = (packId: string) => {
    if (!currentUser) return false;
    const pack = STICKER_PACKS.find(p => p.id === packId);
    if (!pack) return false;
    return pack.stickers.every(s => currentUser.stickers.includes(s));
  };

  const buy = (pack: typeof STICKER_PACKS[0]) => {
    if (!currentUser) return;
    if (currentUser.coins < pack.price) {
      setNotification('❌ Недостаточно монеток!');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    if (owned(pack.id)) {
      setNotification('✅ Этот набор уже куплен');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    setUsers(prev => prev.map(u =>
      u.id === currentUser.id
        ? { ...u, coins: u.coins - pack.price, stickers: [...new Set([...u.stickers, ...pack.stickers])] }
        : u
    ));
    setNotification(`✅ Куплен "${pack.name}"!`);
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>
            🛒 МАГАЗИН
          </h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.6)', fontFamily: 'Rajdhani, sans-serif' }}>
            Покупай стикеры за монетки
          </p>
        </div>
        {currentUser && (
          <div className="px-4 py-2 rounded-xl" style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
          }}>
            <span style={{ color: '#ffd700', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '18px' }}>
              🪙 {currentUser.coins}
            </span>
          </div>
        )}
      </div>

      {notification && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm text-center animate-slide-up" style={{
          background: notification.startsWith('✅') ? 'rgba(0,255,136,0.1)' : 'rgba(255,50,50,0.1)',
          border: `1px solid ${notification.startsWith('✅') ? 'rgba(0,255,136,0.3)' : 'rgba(255,50,50,0.3)'}`,
          color: notification.startsWith('✅') ? '#00ff88' : '#ff6666',
        }}>
          {notification}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {STICKER_PACKS.map(pack => (
          <div key={pack.id} className="sticker-shop-item p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold" style={{ color: rarityColor[pack.rarity], fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                {rarityLabel[pack.rarity]}
              </span>
              {owned(pack.id) && (
                <span className="text-xs" style={{ color: '#00ff88' }}>✓ Куплено</span>
              )}
            </div>

            <div className="flex gap-1 mb-3 flex-wrap">
              {pack.preview.map((s, i) => (
                <span key={i} className="text-2xl">{s}</span>
              ))}
            </div>

            <h3 className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {pack.name}
            </h3>

            <button
              onClick={() => buy(pack)}
              disabled={owned(pack.id)}
              className="w-full py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: owned(pack.id)
                  ? 'rgba(255,255,255,0.05)'
                  : `linear-gradient(135deg, rgba(${pack.rarity === 'limited' ? '255,215,0' : '168,85,247'},0.3), rgba(0,229,255,0.2))`,
                border: `1px solid ${owned(pack.id) ? 'rgba(255,255,255,0.1)' : rarityColor[pack.rarity]}`,
                color: owned(pack.id) ? 'rgba(255,255,255,0.3)' : 'white',
                fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              {owned(pack.id) ? 'КУПЛЕНО' : `🪙 ${pack.price} МОНЕТОК`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopSection;
