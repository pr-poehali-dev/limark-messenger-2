import React, { useState, useRef, useEffect } from 'react';
import { useApp, Message } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

const ChatsSection: React.FC = () => {
  const { users, currentUser, chats, sendMessage, getOrCreateChat, activeChatId, setActiveChatId } = useApp();
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const userChats = chats.filter(c =>
    !c.isChannel && currentUser && c.participants.includes(currentUser.id)
  );

  const filteredUsers = users.filter(u =>
    u.id !== currentUser?.id &&
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getOtherUser = (chat: typeof chats[0]) => {
    const otherId = chat.participants.find(p => p !== currentUser?.id);
    return users.find(u => u.id === otherId);
  };

  const handleSend = () => {
    if (!text.trim() || !activeChatId) return;
    sendMessage(activeChatId, { senderId: currentUser!.id, text: text.trim(), type: 'text' });
    setText('');
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;
    const reader = new FileReader();
    reader.onload = ev => {
      sendMessage(activeChatId, {
        senderId: currentUser!.id,
        image: ev.target?.result as string,
        type: 'image',
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = ev => {
          if (activeChatId) {
            sendMessage(activeChatId, {
              senderId: currentUser!.id,
              voice: ev.target?.result as string,
              type: 'voice',
            });
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      console.warn('Mic unavailable', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
    setMediaRecorder(null);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const getSender = (msg: Message) => users.find(u => u.id === msg.senderId);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return <span className="role-badge badge-admin">ADMIN</span>;
    if (role === 'moder') return <span className="role-badge badge-moder">MOD</span>;
    if (role === 'vip') return <span className="role-badge badge-vip">VIP</span>;
    return null;
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 flex flex-col border-r" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'var(--bg-card)' }}>
        <div className="p-4">
          <h2 className="text-sm font-bold mb-3" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>
            ЧАТЫ
          </h2>
          <input
            className="input-neon w-full px-3 py-2 rounded-lg text-sm"
            placeholder="🔍 Поиск пользователей..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {search ? (
            <>
              <p className="text-xs px-2 mb-2" style={{ color: 'rgba(0,229,255,0.6)', fontFamily: 'Rajdhani, sans-serif' }}>РЕЗУЛЬТАТЫ ПОИСКА</p>
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="sidebar-item flex items-center gap-3 px-3 py-2"
                  onClick={() => {
                    const cid = getOrCreateChat(u.id);
                    setActiveChatId(cid);
                    setSearch('');
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    {u.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white truncate">{u.username}</span>
                      {getRoleBadge(u.role)}
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Не найдено</p>
              )}
            </>
          ) : (
            <>
              {userChats.length === 0 && (
                <p className="text-xs text-center py-8 px-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Rajdhani, sans-serif' }}>
                  Найди пользователей через поиск и начни общение
                </p>
              )}
              {userChats.map(chat => {
                const other = getOtherUser(chat);
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <div
                    key={chat.id}
                    className={`sidebar-item flex items-center gap-3 px-3 py-2 ${activeChatId === chat.id ? 'active' : ''}`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      {other?.avatar || '👤'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{other?.username}</span>
                        {lastMsg && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatTime(lastMsg.timestamp)}</span>}
                      </div>
                      {lastMsg && (
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {lastMsg.type === 'image' ? '📷 Фото' : lastMsg.type === 'voice' ? '🎤 Голосовое' : lastMsg.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col chat-bg">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(0,0,0,0.3)' }}>
              {(() => {
                const other = getOtherUser(activeChat);
                return (
                  <>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      {other?.avatar || '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{other?.username}</span>
                        {other && getRoleBadge(other.role)}
                      </div>
                      <span className="text-xs" style={{ color: 'rgba(0,229,255,0.6)' }}>в сети</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.messages.map(msg => {
                const isMine = msg.senderId === currentUser?.id;
                const sender = getSender(msg);
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 self-end" style={{ background: 'rgba(168,85,247,0.15)' }}>
                        {sender?.avatar || '👤'}
                      </div>
                    )}
                    <div className="max-w-xs">
                      {!isMine && (
                        <p className="text-xs mb-1 ml-1" style={{ color: 'rgba(168,85,247,0.7)' }}>{sender?.username}</p>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${isMine ? 'msg-sent' : 'msg-recv'}`} style={{ borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px' }}>
                        {msg.type === 'text' && <p className="text-sm text-white">{msg.text}</p>}
                        {msg.type === 'image' && <img src={msg.image} alt="" className="max-w-full rounded-lg" style={{ maxHeight: '200px', objectFit: 'contain' }} />}
                        {msg.type === 'voice' && (
                          <div className="flex items-center gap-2">
                            <span>🎤</span>
                            <audio controls src={msg.voice} className="h-8" style={{ filter: 'invert(0.8) hue-rotate(180deg)' }} />
                          </div>
                        )}
                        {msg.type === 'sticker' && <span className="text-4xl">{msg.sticker}</span>}
                      </div>
                      <p className={`text-xs mt-1 ${isMine ? 'text-right' : ''}`} style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(0,0,0,0.3)' }}>
              <div className="flex items-center gap-2">
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImage} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: 'var(--neon-purple)' }}
                  title="Отправить фото"
                >
                  <Icon name="Image" size={16} />
                </button>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: recording ? 'rgba(255,50,50,0.3)' : 'rgba(0,229,255,0.15)',
                    border: `1px solid ${recording ? 'rgba(255,50,50,0.6)' : 'rgba(0,229,255,0.3)'}`,
                    color: recording ? '#ff5555' : 'var(--neon-cyan)',
                    animation: recording ? 'neon-pulse 0.5s infinite' : 'none',
                  }}
                  title="Удержи для записи голоса"
                >
                  <Icon name="Mic" size={16} />
                </button>
                <input
                  className="input-neon flex-1 px-4 py-2.5 rounded-xl text-sm"
                  placeholder="Написать сообщение..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: text.trim() ? 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(0,229,255,0.3))' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${text.trim() ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: text.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    boxShadow: text.trim() ? '0 0 15px rgba(168,85,247,0.3)' : 'none',
                  }}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
              {recording && (
                <p className="text-xs mt-2 text-center animate-neon-pulse" style={{ color: '#ff5555' }}>
                  🔴 Запись... Отпусти для отправки
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 animate-float">💬</div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace', color: 'var(--neon-purple)' }}>
              Выбери чат
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Rajdhani, sans-serif' }}>
              Найди пользователя через поиск
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsSection;