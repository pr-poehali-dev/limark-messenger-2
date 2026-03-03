import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

const AVATARS = ['👤','🦊','🐺','🐉','🦁','🐯','🦋','🐱','👾','🤖','🦅','🌙'];

const ProfileSection: React.FC = () => {
  const { currentUser, setCurrentUser, setUsers } = useApp();
  const [editAvatar, setEditAvatar] = useState(false);
  const [notification, setNotification] = useState('');

  if (!currentUser) return null;

  const changeAvatar = (av: string) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: av } : u));
    setCurrentUser(prev => prev ? { ...prev, avatar: av } : null);
    setEditAvatar(false);
    setNotification('Аватар обновлён!');
    setTimeout(() => setNotification(''), 2000);
  };

  const getRoleBadgeInfo = () => {
    if (currentUser.role === 'admin') return { label: 'ADMIN', style: 'badge-admin', icon: '👑' };
    if (currentUser.role === 'moder') return { label: 'MODER', style: 'badge-moder', icon: '🛡️' };
    if (currentUser.role === 'vip') return { label: 'VIP', style: 'badge-vip', icon: '⭐' };
    return { label: 'USER', style: '', icon: '👤' };
  };

  const roleInfo = getRoleBadgeInfo();

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>
        ПРОФИЛЬ
      </h2>

      {notification && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm text-center animate-slide-up" style={{
          background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88',
        }}>
          {notification}
        </div>
      )}

      {/* Avatar + Name */}
      <div className="rounded-2xl p-6 mb-4" style={{
        background: 'linear-gradient(135deg, var(--bg-card2), rgba(168,85,247,0.08))',
        border: '1px solid rgba(168,85,247,0.3)',
      }}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: 'rgba(168,85,247,0.15)',
                border: '2px solid rgba(168,85,247,0.5)',
                boxShadow: '0 0 20px rgba(168,85,247,0.3)',
              }}
              onClick={() => setEditAvatar(!editAvatar)}
            >
              {currentUser.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-dark)', border: '1px solid rgba(168,85,247,0.4)' }}>
              <Icon name="Pencil" size={10} style={{ color: 'var(--neon-purple)' }} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {currentUser.username}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`role-badge ${roleInfo.style}`}>{roleInfo.icon} {roleInfo.label}</span>
            </div>
          </div>
        </div>

        {editAvatar && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(168,85,247,0.2)' }}>
            <p className="text-xs mb-3" style={{ color: 'rgba(168,85,247,0.7)', fontFamily: 'Rajdhani, sans-serif' }}>ВЫБЕРИ АВАТАР</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(av => (
                <div
                  key={av}
                  onClick={() => changeAvatar(av)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: currentUser.avatar === av ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${currentUser.avatar === av ? 'var(--neon-purple)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {av}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Rajdhani, sans-serif' }}>МОНЕТКИ</p>
          <p className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Orbitron, monospace' }}>
            🪙 {currentUser.coins}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Rajdhani, sans-serif' }}>СТИКЕРЫ</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--neon-purple)', fontFamily: 'Orbitron, monospace' }}>
            {currentUser.stickers.length}
          </p>
        </div>
      </div>

      {/* Stickers */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card2)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(168,85,247,0.8)', letterSpacing: '0.1em' }}>
          МОИ СТИКЕРЫ
        </h3>
        <div className="flex flex-wrap gap-2">
          {currentUser.stickers.map((s, i) => (
            <span key={i} className="text-3xl hover:scale-125 transition-transform cursor-default">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
