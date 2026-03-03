import React, { useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

const ChannelSection: React.FC = () => {
  const { chats, currentUser, users, sendMessage } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channel = chats.find(c => c.isChannel && c.id === 'limark-channel');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channel?.messages]);

  if (!channel) return null;

  const getSender = (senderId: string) => users.find(u => u.id === senderId);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()}.${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const isAdmin = currentUser?.id === channel.channelAdmin || currentUser?.role === 'admin';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{
        borderColor: 'rgba(168,85,247,0.2)',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(0,229,255,0.05))',
      }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,229,255,0.2))',
            border: '1px solid rgba(168,85,247,0.5)',
            boxShadow: '0 0 15px rgba(168,85,247,0.2)',
          }}>
            📢
          </div>
          <div>
            <h2 className="font-bold text-white" style={{ fontFamily: 'Orbitron, monospace', fontSize: '14px' }}>
              {channel.channelName}
            </h2>
            <p className="text-xs" style={{ color: 'rgba(0,229,255,0.6)' }}>
              Официальный канал LiMark • Все пользователи
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-bg">
        {channel.messages.map(msg => {
          const sender = getSender(msg.senderId);
          return (
            <div key={msg.id} className="flex gap-3 animate-message">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 mt-1" style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,229,255,0.1))',
                border: '1px solid rgba(168,85,247,0.3)',
              }}>
                {sender?.avatar || '📢'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--neon-purple)' }}>{sender?.username || 'Система'}</span>
                  {sender?.role === 'admin' && <span className="role-badge badge-admin">ADMIN</span>}
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatTime(msg.timestamp)}</span>
                </div>
                <div className="rounded-xl px-4 py-3" style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(168,85,247,0.15)',
                }}>
                  {msg.type === 'text' && <p className="text-sm text-white leading-relaxed">{msg.text}</p>}
                  {msg.type === 'image' && <img src={msg.image} alt="" className="max-w-sm rounded-lg" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Admin post */}
      {isAdmin && <AdminPost channelId={channel.id} />}

      {!isAdmin && (
        <div className="px-6 py-3 text-center" style={{ borderTop: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Rajdhani, sans-serif' }}>
            Только администраторы могут публиковать посты
          </p>
        </div>
      )}
    </div>
  );
};

const AdminPost: React.FC<{ channelId: string }> = ({ channelId }) => {
  const { currentUser, sendMessage } = useApp();
  const [text, setText] = React.useState('');

  const post = () => {
    if (!text.trim() || !currentUser) return;
    sendMessage(channelId, { senderId: currentUser.id, text: text.trim(), type: 'text' });
    setText('');
  };

  return (
    <div className="p-4 border-t" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(0,0,0,0.3)' }}>
      <div className="flex gap-2">
        <input
          className="input-neon flex-1 px-4 py-2.5 rounded-xl text-sm"
          placeholder="Написать анонс..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && post()}
        />
        <button
          onClick={post}
          disabled={!text.trim()}
          className="neon-btn px-5 py-2.5 rounded-xl text-sm"
        >
          📢 ОПУБЛИКОВАТЬ
        </button>
      </div>
    </div>
  );
};

export default ChannelSection;
