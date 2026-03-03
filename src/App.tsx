import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import {
  getState, setState, subscribe, getCurrentUser,
  getChatMessages, getUserChats, createOrOpenDirectChat,
  sendMessage, registerUser, loginUser, logoutUser,
  type User, type Message, type Chat, type AppState
} from './store';

function useStore<T>(selector: (s: AppState) => T): T {
  const [val, setVal] = useState(() => selector(getState()));
  useEffect(() => {
    const unsub = subscribe(() => setVal(selector(getState())));
    return unsub;
  }, []);
  return val;
}

// ─── LOADING ───────────────────────────────────────────────────────
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [dotPhase, setDotPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onDone, 400); return 100; }
        return p + 100 / 60;
      });
    }, 100);
    const dotInt = setInterval(() => setDotPhase(p => (p + 1) % 3), 600);
    return () => { clearInterval(interval); clearInterval(dotInt); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'var(--bg-dark)' }}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full border"
            style={{
              width: `${200 + i * 150}px`, height: `${200 + i * 150}px`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              borderColor: i % 2 === 0 ? 'rgba(184,79,255,0.15)' : 'rgba(0,212,255,0.1)',
              animation: `spin-slow ${6 + i * 2}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }} />
        ))}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`, height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-blue)',
              animation: `particle-float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
              boxShadow: `0 0 6px ${i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-blue)'}`,
            }} />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="font-orbitron font-black text-6xl md:text-8xl gradient-text animate-glitch select-none">LiMark</div>
        <div className="text-muted-foreground font-rubik text-sm tracking-widest uppercase opacity-60">Мессенджер нового поколения</div>
        <div className="flex gap-4 items-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full"
              style={{
                width: '14px', height: '14px',
                background: dotPhase === i ? 'white' : 'rgba(184,79,255,0.3)',
                boxShadow: dotPhase === i ? '0 0 15px var(--neon-purple), 0 0 30px var(--neon-purple)' : 'none',
                animation: `bounce-dot 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                transition: 'all 0.3s ease',
              }} />
          ))}
        </div>
        <div className="w-64 md:w-80 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(184,79,255,0.15)' }}>
          <div className="h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-blue))', boxShadow: '0 0 10px var(--neon-purple)' }} />
        </div>
        <div className="text-xs font-orbitron opacity-40" style={{ color: 'var(--neon-blue)' }}>{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

// ─── AUTH ──────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handle = () => {
    setError(''); setSuccess('');
    if (mode === 'login') {
      const r = loginUser(username, password);
      if (!r.ok) setError(r.error || 'Ошибка');
    } else {
      const r = registerUser(username, password);
      if (!r.ok) { setError(r.error || 'Ошибка'); return; }
      setSuccess('Аккаунт создан! Выполняю вход...');
      setTimeout(() => loginUser(username, password), 800);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl font-rubik text-sm outline-none transition-all duration-200";
  const inpStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(184,79,255,0.3)', color: 'white' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-dark)' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--neon-purple)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--neon-blue)' }} />
      </div>
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="font-orbitron font-black text-4xl gradient-text mb-2">LiMark</div>
          <div className="text-xs text-muted-foreground tracking-widest uppercase">{mode === 'login' ? 'Добро пожаловать' : 'Создай аккаунт'}</div>
        </div>
        <div className="glass-card rounded-2xl p-8 space-y-5">
          <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className="flex-1 py-2.5 text-sm font-rubik font-medium transition-all duration-200"
                style={mode === m ? { background: 'linear-gradient(135deg,rgba(184,79,255,0.3),rgba(0,212,255,0.2))', color: 'var(--neon-purple)' } : { color: '#888' }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-rubik text-muted-foreground tracking-wider uppercase mb-2 block">Никнейм</label>
              <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} placeholder="Введи никнейм..." className={inp} style={inpStyle} />
            </div>
            <div>
              <label className="text-xs font-rubik text-muted-foreground tracking-wider uppercase mb-2 block">Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} placeholder="••••••••" className={inp} style={inpStyle} />
            </div>
          </div>
          {error && <div className="text-sm font-rubik px-4 py-3 rounded-xl" style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.2)' }}>{error}</div>}
          {success && <div className="text-sm font-rubik px-4 py-3 rounded-xl" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)' }}>{success}</div>}
          <button onClick={handle} className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-wide neon-btn-purple">
            {mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROLE BADGE ────────────────────────────────────────────────────
function RoleBadge({ role, isSpecial }: { role: string; isSpecial?: string }) {
  if (isSpecial === 'mrlis') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>ADMIN</span>;
  if (isSpecial === 'sova') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(255,200,0,0.2)', color: '#ffd700', border: '1px solid rgba(255,200,0,0.4)' }}>🦉 СОВА</span>;
  if (isSpecial === 'mary') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(255,0,204,0.2)', color: 'var(--neon-pink)', border: '1px solid rgba(255,0,204,0.4)' }}>🌸 MARY</span>;
  if (role === 'admin') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>ADMIN</span>;
  if (role === 'moderator') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(0,212,255,0.2)', color: 'var(--neon-blue)', border: '1px solid rgba(0,212,255,0.4)' }}>MOD</span>;
  if (role === 'vip') return <span className="text-xs px-2 py-0.5 rounded-full font-orbitron" style={{ background: 'rgba(255,214,0,0.2)', color: '#ffd700', border: '1px solid rgba(255,214,0,0.4)' }}>VIP</span>;
  return null;
}

// ─── GLOBAL BANNER ─────────────────────────────────────────────────
function GlobalBanner() {
  const gm = useStore(s => s.globalMessage);
  if (!gm) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center font-rubik text-sm font-medium animate-slide-up"
      style={{ background: gm.color || 'linear-gradient(90deg,rgba(184,79,255,0.9),rgba(0,212,255,0.9))', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      <span className="opacity-70 mr-2">📢 {gm.fromName}:</span>{gm.text}
      <button className="ml-4 opacity-60 hover:opacity-100" onClick={() => setState(s => ({ ...s, globalMessage: null }))}>✕</button>
    </div>
  );
}

// ─── CHAT VIEW ─────────────────────────────────────────────────────
function ChatView({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const me = getCurrentUser()!;
  const messages = useStore(s => s.messages.filter(m => m.chatId === chat.id).sort((a, b) => a.timestamp - b.timestamp));
  const users = useStore(s => s.users);
  const myStickers = useStore(s => s.users.find(u => u.id === me.id)?.stickers ?? []);
  const shopItems = useStore(s => s.shopItems);
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const getUser = (id: string) => users.find(u => u.id === id);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({ chatId: chat.id, senderId: me.id, text: text.trim(), timestamp: Date.now(), type: 'text' });
    setText('');
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      sendMessage({ chatId: chat.id, senderId: me.id, imageUrl: ev.target?.result as string, timestamp: Date.now(), type: 'image' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        sendMessage({ chatId: chat.id, senderId: me.id, voiceUrl: url, voiceDuration: recordingTime, timestamp: Date.now(), type: 'voice' });
        stream.getTracks().forEach(t => t.stop());
        setRecordingTime(0);
      };
      mr.start();
      setMediaRecorder(mr);
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (e) { alert('Нет доступа к микрофону'); }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setMediaRecorder(null);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const myAvailableStickers = shopItems.filter(s => myStickers.includes(s.id));
  const otherUser = chat.type === 'direct' ? getUser(chat.participants.find(p => p !== me.id) ?? '') : null;
  const chatName = chat.isChannel ? chat.name : (otherUser?.username ?? 'Чат');
  const chatAvatar = chat.isChannel ? (chat.avatar ?? '📢') : (otherUser?.avatar ?? '👤');
  const canWrite = !chat.isChannel || me.isSpecial === 'mrlis';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'var(--bg-card)' }}>
        <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors md:hidden">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="text-2xl">{chatAvatar}</div>
        <div className="flex-1 min-w-0">
          <div className="font-rubik font-medium text-white truncate">{chatName}</div>
          {otherUser && <RoleBadge role={otherUser.role} isSpecial={otherUser.isSpecial} />}
          {chat.isChannel && <div className="text-xs text-muted-foreground">{chat.participants.length} участников</div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const sender = getUser(msg.senderId);
          const isMe = msg.senderId === me.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && <div className="text-xl flex-shrink-0 mt-1">{sender?.avatar ?? '👤'}</div>}
              <div className={`max-w-xs md:max-w-sm space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && <div className="text-xs text-muted-foreground px-1">{sender?.username}</div>}
                <div className="rounded-2xl px-4 py-2.5 font-rubik text-sm"
                  style={isMe
                    ? { background: 'linear-gradient(135deg,rgba(123,47,255,0.7),rgba(0,212,255,0.4))', color: 'white', borderBottomRightRadius: '4px' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', borderBottomLeftRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }
                  }>
                  {msg.type === 'text' && <span>{msg.text}</span>}
                  {msg.type === 'sticker' && <span className="text-4xl">{msg.stickerEmoji}</span>}
                  {msg.type === 'image' && msg.imageUrl && <img src={msg.imageUrl} alt="img" className="max-w-full rounded-xl max-h-64 object-cover" />}
                  {msg.type === 'voice' && msg.voiceUrl && (
                    <div className="flex items-center gap-2">
                      <Icon name="Mic" size={14} />
                      <audio controls src={msg.voiceUrl} style={{ height: '32px', maxWidth: '180px' }} />
                      <span className="text-xs opacity-60">{msg.voiceDuration}с</span>
                    </div>
                  )}
                </div>
                <div className="text-xs opacity-40 px-1">{new Date(msg.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showStickers && (
        <div className="border-t p-3 grid grid-cols-6 gap-2 flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'var(--bg-card)', maxHeight: '120px', overflowY: 'auto' }}>
          {myAvailableStickers.length === 0
            ? <div className="col-span-6 text-center text-xs text-muted-foreground py-2">Нет стикеров. Купи в магазине!</div>
            : myAvailableStickers.map(s => (
              <button key={s.id} className="text-2xl hover:scale-110 transition-transform"
                onClick={() => { sendMessage({ chatId: chat.id, senderId: me.id, stickerEmoji: s.emoji, timestamp: Date.now(), type: 'sticker' }); setShowStickers(false); }}>
                {s.emoji}
              </button>
            ))}
        </div>
      )}

      {canWrite ? (
        <div className="border-t px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'var(--bg-card)' }}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-white transition-colors p-1.5">
            <Icon name="Image" size={18} />
          </button>
          <button onClick={() => setShowStickers(!showStickers)} className="text-muted-foreground hover:text-white transition-colors p-1.5">
            <Icon name="Smile" size={18} />
          </button>
          {isRecording ? (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,50,50,0.15)', border: '1px solid rgba(255,50,50,0.3)' }}>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-rubik text-red-400">Запись {recordingTime}с</span>
            </div>
          ) : (
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Напиши сообщение..." className="flex-1 px-4 py-2.5 rounded-xl font-rubik text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(184,79,255,0.2)', color: 'white' }} />
          )}
          <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
            className="p-1.5 transition-colors" style={{ color: isRecording ? '#ff4444' : 'var(--neon-purple)' }}>
            <Icon name="Mic" size={18} />
          </button>
          {!isRecording && text.trim() && (
            <button onClick={handleSend} className="p-2 rounded-xl neon-btn-purple">
              <Icon name="Send" size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'var(--bg-card)' }}>
          Только администратор пишет в этот канал
        </div>
      )}
    </div>
  );
}

// ─── CHATS PANEL ───────────────────────────────────────────────────
function ChatsPanel({ onSelectChat }: { onSelectChat: (chat: Chat) => void }) {
  const me = getCurrentUser()!;
  const myChats = useStore(s => getUserChats(me.id).sort((a, b) => (b.lastTime ?? 0) - (a.lastTime ?? 0)));
  const users = useStore(s => s.users);
  const [search, setSearch] = useState('');

  const allUsers = users.filter(u => u.id !== me.id && u.username.toLowerCase().includes(search.toLowerCase()));

  const getChatDisplay = (chat: Chat) => {
    if (chat.isChannel) return { name: chat.name ?? 'Канал', avatar: chat.avatar ?? '📢' };
    const other = users.find(u => u.id !== me.id && chat.participants.includes(u.id));
    return { name: other?.username ?? 'Чат', avatar: other?.avatar ?? '👤' };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)' }}>
        <div className="font-orbitron font-bold text-lg gradient-text mb-3">Чаты</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Поиск пользователей..."
          className="w-full px-3 py-2 rounded-xl text-sm font-rubik outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(184,79,255,0.2)', color: 'white' }} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {search ? (
          <div>
            <div className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">Пользователи</div>
            {allUsers.map(u => (
              <button key={u.id} onClick={() => { const id = createOrOpenDirectChat(me.id, u.id); onSelectChat(getState().chats.find(c => c.id === id)!); setSearch(''); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                <div className="text-2xl">{u.avatar}</div>
                <div><div className="font-rubik font-medium text-sm text-white">{u.username}</div><RoleBadge role={u.role} isSpecial={u.isSpecial} /></div>
              </button>
            ))}
            {allUsers.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Не найдено</div>}
          </div>
        ) : (
          myChats.map(chat => {
            const { name, avatar } = getChatDisplay(chat);
            return (
              <button key={chat.id} onClick={() => onSelectChat(chat)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b"
                style={{ borderColor: 'rgba(184,79,255,0.05)' }}>
                <div className="text-2xl flex-shrink-0">{avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-rubik font-medium text-sm text-white truncate">{name}</div>
                  {chat.lastMessage && <div className="text-xs text-muted-foreground truncate">{chat.lastMessage}</div>}
                </div>
                {chat.lastTime && <div className="text-xs text-muted-foreground flex-shrink-0">{new Date(chat.lastTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── GAMES ─────────────────────────────────────────────────────────
function GameMemory() {
  const me = getCurrentUser()!;
  const emojis = ['🎮', '🔥', '⚡', '💎', '🌟', '🎯', '🦋', '🚀'];
  const mkCards = () => [...emojis, ...emojis].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })).sort(() => Math.random() - 0.5);
  const [cards, setCards] = useState(mkCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const flip = (id: number) => {
    if (selected.length === 2 || cards[id].flipped || cards[id].matched) return;
    const newSel = [...selected, id];
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards); setSelected(newSel);
    if (newSel.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSel;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched); setSelected([]);
        if (matched.every(c => c.matched)) {
          setWon(true);
          if (!rewarded) { setState(s => ({ ...s, users: s.users.map(u => u.id === me.id ? { ...u, coins: u.coins + 10 } : u) })); setRewarded(true); }
        }
      } else {
        setTimeout(() => { setCards(prev => prev.map(c => newSel.includes(c.id) && !c.matched ? { ...c, flipped: false } : c)); setSelected([]); }, 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-rubik text-sm text-muted-foreground">Ходы: <span className="text-white font-bold">{moves}</span></div>
        <button onClick={() => { setCards(mkCards()); setSelected([]); setMoves(0); setWon(false); setRewarded(false); }} className="text-xs px-3 py-1.5 rounded-lg neon-btn-blue">Заново</button>
      </div>
      {won && <div className="text-center py-2 rounded-xl font-orbitron text-sm" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>🎉 Победа! +10 монеток!</div>}
      <div className="grid grid-cols-4 gap-2">
        {cards.map(c => (
          <button key={c.id} onClick={() => flip(c.id)}
            className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200"
            style={c.flipped || c.matched
              ? { background: c.matched ? 'rgba(0,255,136,0.15)' : 'rgba(184,79,255,0.2)', border: `1px solid ${c.matched ? 'rgba(0,255,136,0.5)' : 'rgba(184,79,255,0.5)'}` }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {(c.flipped || c.matched) ? c.emoji : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameCatchStars() {
  const me = getCurrentUser()!;
  const [stars, setStars] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOn, setGameOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [rewarded, setRewarded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emojis = ['⭐', '🌟', '💫', '✨', '🔥', '⚡'];

  const stop = useCallback(() => {
    setGameOn(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    setStars([]);
  }, []);

  const start = () => {
    setScore(0); setGameOn(true); setTimeLeft(20); setRewarded(false);
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { stop(); return 0; } return t - 1; }), 1000);
    spawnRef.current = setInterval(() => setStars(prev => [...prev.slice(-8), { id: Date.now(), x: Math.random() * 80 + 5, y: Math.random() * 70 + 10, emoji: emojis[Math.floor(Math.random() * emojis.length)] }]), 600);
  };

  const catchStar = (id: number) => {
    setStars(prev => prev.filter(s => s.id !== id));
    setScore(s => {
      const ns = s + 1;
      if (ns >= 15 && !rewarded) { setState(st => ({ ...st, users: st.users.map(u => u.id === me.id ? { ...u, coins: u.coins + 5 } : u) })); setRewarded(true); }
      return ns;
    });
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (spawnRef.current) clearInterval(spawnRef.current); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-rubik text-sm">Счёт: <span className="font-bold text-yellow-400">{score}</span> | Время: <span className="font-bold" style={{ color: timeLeft < 5 ? '#ff4444' : 'white' }}>{timeLeft}с</span></div>
        {!gameOn ? <button onClick={start} className="text-xs px-3 py-1.5 rounded-lg neon-btn-purple">Старт</button>
          : <button onClick={stop} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>Стоп</button>}
      </div>
      {!gameOn && score > 0 && <div className="text-center py-2 rounded-xl text-sm font-rubik" style={{ background: 'rgba(184,79,255,0.1)', color: 'var(--neon-purple)' }}>{score >= 15 ? `🎉 Отлично! +5 монеток!` : `${score} звёзд. Нужно 15 для награды!`}</div>}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: '220px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(184,79,255,0.2)' }}>
        {!gameOn && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-rubik text-sm">Нажми Старт!</div>}
        {stars.map(s => (
          <button key={s.id} onClick={() => catchStar(s.id)} className="absolute text-2xl hover:scale-125 transition-transform animate-fade-in"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}>
            {s.emoji}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">Поймай 15 звёзд за 20 сек → +5 монеток</div>
    </div>
  );
}

function GameTicTacToe() {
  const me = getCurrentUser()!;
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [rewarded, setRewarded] = useState(false);
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const checkWinner = (b: (string | null)[]) => { for (const [a, c, d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? 'draw' : null; };

  const click = (i: number) => {
    if (board[i] || winner) return;
    const nb = board.map((v, idx) => idx === i ? (isX ? '❌' : '⭕') : v);
    const w = checkWinner(nb);
    setBoard(nb); setIsX(!isX);
    if (w) { setWinner(w); if (w === '❌' && !rewarded) { setState(s => ({ ...s, users: s.users.map(u => u.id === me.id ? { ...u, coins: u.coins + 3 } : u) })); setRewarded(true); } }
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); setWinner(null); setRewarded(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-rubik text-sm text-muted-foreground">{winner ? (winner === 'draw' ? 'Ничья!' : `Победил ${winner}!`) : `Ход: ${isX ? '❌' : '⭕'}`}</div>
        <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg neon-btn-blue">Заново</button>
      </div>
      {winner && <div className="text-center py-2 rounded-xl text-sm font-rubik" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>
        {winner === '❌' ? '🎉 +3 монетки!' : winner === 'draw' ? '🤝 Ничья!' : '😮 Поражение!'}
      </div>}
      <div className="grid grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button key={i} onClick={() => click(i)} className="aspect-square text-3xl rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ background: v ? 'rgba(184,79,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(184,79,255,0.2)' }}>
            {v}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">Победи ❌ → +3 монетки</div>
    </div>
  );
}

function GamesPage() {
  const [activeGame, setActiveGame] = useState<'memory' | 'stars' | 'tictactoe'>('memory');
  const coins = useStore(s => s.users.find(u => u.id === s.currentUserId)?.coins ?? 0);
  const games = [
    { id: 'memory' as const, name: 'Мемори', emoji: '🧠', desc: '+10 монет' },
    { id: 'stars' as const, name: 'Лови звёзды', emoji: '⭐', desc: '+5 монет' },
    { id: 'tictactoe' as const, name: 'Крестики', emoji: '❌', desc: '+3 монеты' },
  ];
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="font-orbitron font-bold text-xl gradient-text">Мини-Игры</div>
        <div className="text-sm font-rubik" style={{ color: 'var(--neon-yellow)' }}>🪙 {coins}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {games.map(g => (
          <button key={g.id} onClick={() => setActiveGame(g.id)}
            className="p-3 rounded-xl text-center transition-all duration-200"
            style={activeGame === g.id
              ? { background: 'rgba(184,79,255,0.2)', border: '1px solid rgba(184,79,255,0.5)', boxShadow: '0 0 15px rgba(184,79,255,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-2xl mb-1">{g.emoji}</div>
            <div className="text-xs font-rubik text-white">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.desc}</div>
          </button>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-4">
        {activeGame === 'memory' && <GameMemory />}
        {activeGame === 'stars' && <GameCatchStars />}
        {activeGame === 'tictactoe' && <GameTicTacToe />}
      </div>
    </div>
  );
}

// ─── SHOP ──────────────────────────────────────────────────────────
function ShopPage() {
  const me = getCurrentUser()!;
  const shopItems = useStore(s => s.shopItems);
  const myCoins = useStore(s => s.users.find(u => u.id === s.currentUserId)?.coins ?? 0);
  const myStickers = useStore(s => s.users.find(u => u.id === s.currentUserId)?.stickers ?? []);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const buy = (item: typeof shopItems[0]) => {
    if (myStickers.includes(item.id)) { setMsg({ text: 'Уже куплено!', ok: false }); return; }
    if (myCoins < item.price) { setMsg({ text: 'Недостаточно монеток!', ok: false }); return; }
    setState(s => ({ ...s, users: s.users.map(u => u.id === me.id ? { ...u, coins: u.coins - item.price, stickers: [...u.stickers, item.id] } : u) }));
    setMsg({ text: `${item.emoji} Куплено!`, ok: true });
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="font-orbitron font-bold text-xl gradient-text">Магазин</div>
        <div className="text-sm font-rubik px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,214,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,214,0,0.3)' }}>🪙 {myCoins}</div>
      </div>
      {msg && <div className="px-4 py-2.5 rounded-xl text-sm font-rubik text-center" style={{ background: msg.ok ? 'rgba(0,255,136,0.1)' : 'rgba(255,50,50,0.1)', color: msg.ok ? 'var(--neon-green)' : '#ff6b6b', border: `1px solid ${msg.ok ? 'rgba(0,255,136,0.3)' : 'rgba(255,50,50,0.3)'}` }}>{msg.text}</div>}
      <div className="grid grid-cols-2 gap-3">
        {shopItems.map(item => {
          const owned = myStickers.includes(item.id);
          return (
            <div key={item.id} className="glass-card rounded-xl p-4 flex flex-col gap-2" style={item.isLimited ? { border: '1px solid rgba(255,214,0,0.4)', background: 'rgba(255,214,0,0.03)' } : {}}>
              <div className="text-4xl text-center">{item.emoji}</div>
              <div className="text-center">
                <div className="font-rubik font-medium text-sm text-white">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
              {item.isLimited && <div className="text-xs text-center font-orbitron" style={{ color: '#ffd700' }}>✨ ЛИМИТЕД</div>}
              <button onClick={() => buy(item)} disabled={owned}
                className="py-2 rounded-xl text-xs font-orbitron font-bold transition-all"
                style={owned
                  ? { background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)', cursor: 'default' }
                  : myCoins >= item.price
                    ? { background: 'linear-gradient(135deg,#7b2fff,#b84fff)', color: 'white', boxShadow: '0 0 15px rgba(184,79,255,0.4)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#666', border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed' }}>
                {owned ? '✓ Куплено' : `🪙 ${item.price}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────────
function ProfilePage() {
  const me = getCurrentUser()!;
  const coins = useStore(s => s.users.find(u => u.id === s.currentUserId)?.coins ?? 0);
  const stickers = useStore(s => s.users.find(u => u.id === s.currentUserId)?.stickers ?? []);
  const shopItems = useStore(s => s.shopItems);
  const myItems = shopItems.filter(i => stickers.includes(i.id));
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="font-orbitron font-bold text-xl gradient-text">Профиль</div>
      <div className="glass-card rounded-2xl p-6 text-center space-y-3">
        <div className="text-6xl">{me.avatar}</div>
        <div className="font-orbitron font-bold text-2xl text-white">{me.username}</div>
        <RoleBadge role={me.role} isSpecial={me.isSpecial} />
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-lg font-rubik font-bold" style={{ color: '#ffd700' }}>🪙 {coins}</span>
          <span className="text-sm text-muted-foreground">монеток</span>
        </div>
        <div className="text-xs text-muted-foreground">С нами с {new Date(me.createdAt).toLocaleDateString('ru')}</div>
      </div>
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-purple)' }}>МОИ СТИКЕРЫ ({myItems.length})</div>
        {myItems.length === 0
          ? <div className="text-center text-sm text-muted-foreground py-4">Нет стикеров. Загляни в магазин!</div>
          : <div className="flex flex-wrap gap-3">{myItems.map(i => <span key={i.id} title={i.name} className="text-3xl">{i.emoji}</span>)}</div>}
      </div>
      <button onClick={logoutUser} className="w-full py-3 rounded-xl font-orbitron font-bold text-sm" style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.3)' }}>
        ВЫЙТИ
      </button>
    </div>
  );
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────
function AnnouncementsPage({ onOpenChat }: { onOpenChat: (chat: Chat) => void }) {
  const channel = useStore(s => s.chats.find(c => c.id === 'channel-limark-announcements'));
  if (!channel) return null;
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="font-orbitron font-bold text-xl gradient-text">LiMark Анонсы</div>
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div className="text-4xl">📢</div>
        <div className="flex-1">
          <div className="font-rubik font-medium text-white">LiMark Анонсы</div>
          <div className="text-xs text-muted-foreground">{channel.participants.length} подписчиков</div>
        </div>
        <button onClick={() => onOpenChat(channel)} className="px-4 py-2 rounded-xl text-sm neon-btn-purple font-rubik">Открыть</button>
      </div>
    </div>
  );
}

// ─── HOME ───────────────────────────────────────────────────────────
function HomePage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const me = getCurrentUser()!;
  const coins = useStore(s => s.users.find(u => u.id === s.currentUserId)?.coins ?? 0);
  const activeEvent = useStore(s => s.activeEvent);
  const [owlCoins, setOwlCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [flowerClicks, setFlowerClicks] = useState({ roses: 0, tulips: 0 });
  const [limitedGiven, setLimitedGiven] = useState(false);

  const clickOwl = () => {
    setState(s => ({ ...s, users: s.users.map(u => u.id === me.id ? { ...u, coins: u.coins + 1 } : u) }));
    const id = Date.now();
    setOwlCoins(prev => [...prev, { id, x: Math.random() * 80 + 10, y: Math.random() * 40 + 20 }]);
    setTimeout(() => setOwlCoins(prev => prev.filter(c => c.id !== id)), 600);
  };

  const clickFlower = (type: 'rose' | 'tulip') => {
    setFlowerClicks(prev => {
      const updated = type === 'rose' ? { ...prev, roses: prev.roses + 1 } : { ...prev, tulips: prev.tulips + 1 };
      if (updated.roses >= 10 && updated.tulips >= 10 && !limitedGiven) {
        const LIMITED = ['s9','s10','s11','s12','s13','s14'];
        setState(s => ({ ...s, users: s.users.map(u => u.id === me.id ? { ...u, stickers: [...new Set([...u.stickers, ...LIMITED])] } : u) }));
        setLimitedGiven(true);
      }
      return updated;
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{me.avatar}</div>
          <div>
            <div className="font-orbitron font-bold text-lg gradient-text">Привет, {me.username}!</div>
            <div className="text-sm text-muted-foreground font-rubik">🪙 {coins} монеток</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'MessageCircle', label: 'Чаты', tab: 'chats', color: 'var(--neon-purple)' },
          { icon: 'Gamepad2', label: 'Игры', tab: 'games', color: 'var(--neon-blue)' },
          { icon: 'ShoppingBag', label: 'Магазин', tab: 'shop', color: 'var(--neon-pink)' },
        ].map(item => (
          <button key={item.tab} onClick={() => onNavigate(item.tab)}
            className="glass-card rounded-xl p-4 text-center transition-all duration-200 hover:scale-105"
            style={{ borderColor: `${item.color}33` }}>
            <Icon name={item.icon as 'MessageCircle'} size={24} style={{ color: item.color, margin: '0 auto 8px' }} />
            <div className="text-xs font-rubik text-white">{item.label}</div>
          </button>
        ))}
      </div>

      {activeEvent === 'owls' && (
        <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,214,0,0.3)' }}>
          <div className="font-orbitron text-sm" style={{ color: '#ffd700' }}>🦉 ИВЕНТ СОВЫ!</div>
          <div className="relative rounded-xl overflow-hidden" style={{ height: '140px', background: 'linear-gradient(180deg,#0a0a2e,#1a1040)' }}>
            {owlCoins.map(c => (
              <div key={c.id} className="absolute text-sm font-bold animate-coin-pop pointer-events-none" style={{ left: `${c.x}%`, top: `${c.y}%`, color: '#ffd700' }}>+1🪙</div>
            ))}
            <div className="absolute inset-0 flex items-end justify-around pb-4">
              {['🦉','🦉','🦉','🦉'].map((owl, i) => (
                <button key={i} onClick={clickOwl} className="text-3xl hover:scale-110 transition-transform active:scale-95"
                  style={{ textShadow: '0 0 10px rgba(255,214,0,0.5)' }}>{owl}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground font-rubik">Нажимай на сов — получай монетки!</div>
        </div>
      )}

      {activeEvent === 'roses' && (
        <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,0,204,0.3)' }}>
          <div className="font-orbitron text-sm" style={{ color: 'var(--neon-pink)' }}>🌹 ИВЕНТ РОЗ!</div>
          <div className="text-xs text-muted-foreground font-rubik">Нажми на 10 роз и 10 тюльпанов → лимитированные стикеры!</div>
          <div className="flex gap-6 text-sm font-rubik">
            <span>🌹 {flowerClicks.roses}/10</span>
            <span>🌷 {flowerClicks.tulips}/10</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => <button key={`r${i}`} onClick={() => clickFlower('rose')} className="text-2xl hover:scale-110 transition-transform">🌹</button>)}
            {[...Array(5)].map((_, i) => <button key={`t${i}`} onClick={() => clickFlower('tulip')} className="text-2xl hover:scale-110 transition-transform">🌷</button>)}
          </div>
          {limitedGiven && <div className="text-center text-sm font-rubik py-2 rounded-xl" style={{ background: 'rgba(255,0,204,0.1)', color: 'var(--neon-pink)', border: '1px solid rgba(255,0,204,0.3)' }}>🎉 Стикеры получены: 🌹🌺🏵🌷🌸🪻</div>}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────
function AdminPanel() {
  const users = useStore(s => s.users);
  const [bTarget, setBTarget] = useState(''); const [bMins, setBMins] = useState('60'); const [bReason, setBReason] = useState('');
  const [gMsg, setGMsg] = useState('');
  const [cTarget, setCTarget] = useState(''); const [cAmount, setCAmount] = useState('10');
  const [rTarget, setRTarget] = useState(''); const [newRole, setNewRole] = useState<'user'|'moderator'|'vip'|'admin'>('moderator');
  const [msg, setMsg] = useState('');
  const notify = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const blockUser = () => {
    const u = users.find(u => u.username.toLowerCase() === bTarget.toLowerCase());
    if (!u) { notify('Не найден'); return; } if (u.isSpecial) { notify('Нельзя'); return; }
    setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === bTarget.toLowerCase() ? { ...u, isBlocked: true, blockedUntil: Date.now() + parseInt(bMins) * 60000, blockReason: bReason } : u) }));
    notify(`✅ ${bTarget} заблокирован на ${bMins} мин.`); setBTarget(''); setBReason('');
  };
  const sendGlobal = () => {
    if (!gMsg.trim()) return;
    setState(s => ({ ...s, globalMessage: { id: `gm-${Date.now()}`, text: gMsg, fromName: 'MrLis', color: 'linear-gradient(90deg,rgba(184,79,255,0.95),rgba(0,212,255,0.95))', timestamp: Date.now() } }));
    notify('✅ Отправлено'); setGMsg('');
  };
  const giveCoins = () => {
    const u = users.find(u => u.username.toLowerCase() === cTarget.toLowerCase());
    if (!u) { notify('Не найден'); return; }
    setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === cTarget.toLowerCase() ? { ...u, coins: u.coins + parseInt(cAmount) } : u) }));
    notify(`✅ Выдано ${cAmount} монеток`); setCTarget('');
  };
  const assignRole = () => {
    const u = users.find(u => u.username.toLowerCase() === rTarget.toLowerCase());
    if (!u) { notify('Не найден'); return; } if (u.isSpecial) { notify('Нельзя'); return; }
    setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === rTarget.toLowerCase() ? { ...u, role: newRole } : u) }));
    notify(`✅ Роль назначена`); setRTarget('');
  };

  const inp = "w-full px-3 py-2 rounded-xl text-sm font-rubik outline-none";
  const ist = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(184,79,255,0.3)', color: 'white' as const };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="font-orbitron font-bold text-xl" style={{ color: '#ff6b6b' }}>👑 ADMIN ПАНЕЛЬ</div>
      {msg && <div className="px-4 py-2.5 rounded-xl text-sm text-center font-rubik" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>{msg}</div>}

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-purple)' }}>🔒 БЛОКИРОВКА</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={bTarget} onChange={e => setBTarget(e.target.value)} />
        <input className={inp} style={ist} placeholder="Минуты" type="number" value={bMins} onChange={e => setBMins(e.target.value)} />
        <input className={inp} style={ist} placeholder="Причина" value={bReason} onChange={e => setBReason(e.target.value)} />
        <button onClick={blockUser} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>ЗАБЛОКИРОВАТЬ</button>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-blue)' }}>📢 НАПИСАТЬ ВСЕМ</div>
        <input className={inp} style={ist} placeholder="Сообщение..." value={gMsg} onChange={e => setGMsg(e.target.value)} />
        <button onClick={sendGlobal} className="w-full py-2.5 rounded-xl text-sm font-orbitron neon-btn-purple">ОТПРАВИТЬ</button>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: '#ffd700' }}>🪙 МОНЕТКИ</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={cTarget} onChange={e => setCTarget(e.target.value)} />
        <input className={inp} style={ist} placeholder="Кол-во" type="number" value={cAmount} onChange={e => setCAmount(e.target.value)} />
        <button onClick={giveCoins} className="w-full py-2.5 rounded-xl text-sm font-orbitron neon-btn-blue">ВЫДАТЬ</button>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-green)' }}>⚡ РОЛИ</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={rTarget} onChange={e => setRTarget(e.target.value)} />
        <select value={newRole} onChange={e => setNewRole(e.target.value as never)} className={inp} style={ist}>
          <option value="user">User</option><option value="moderator">Moderator</option><option value="vip">VIP</option><option value="admin">Admin</option>
        </select>
        <button onClick={assignRole} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.4)' }}>НАЗНАЧИТЬ</button>
      </div>

      <button onClick={() => setState(s => ({ ...s, globalMessage: { id: `gm-${Date.now()}`, text: '🛒 Магазин обновлён! Загляни!', fromName: 'MrLis', color: 'linear-gradient(90deg,rgba(184,79,255,0.95),rgba(0,212,255,0.95))', timestamp: Date.now() } }))}
        className="w-full py-3 rounded-xl text-sm font-orbitron neon-btn-blue">🛒 ПРИЗВАТЬ МАГАЗИН</button>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-yellow)' }}>🎪 ИВЕНТЫ</div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setState(s => ({ ...s, activeEvent: s.activeEvent === 'owls' ? null : 'owls' }))} className="py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,214,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,214,0,0.4)' }}>🦉 СОВЫ</button>
          <button onClick={() => setState(s => ({ ...s, activeEvent: s.activeEvent === 'roses' ? null : 'roses' }))} className="py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,0,204,0.15)', color: 'var(--neon-pink)', border: '1px solid rgba(255,0,204,0.4)' }}>🌹 РОЗЫ</button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="font-orbitron text-sm text-muted-foreground">ПОЛЬЗОВАТЕЛИ ({users.length})</div>
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between py-1.5 border-b text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-rubik text-white">{u.avatar} {u.username}</span>
            <div className="flex items-center gap-2"><RoleBadge role={u.role} isSpecial={u.isSpecial} />{u.isBlocked && <span className="text-xs text-red-400">🔒</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SOVA PANEL ─────────────────────────────────────────────────────
function SovaPanel() {
  const users = useStore(s => s.users);
  const [bTarget, setBTarget] = useState(''); const [bMins, setBMins] = useState('60'); const [bReason, setBReason] = useState('');
  const [gMsg, setGMsg] = useState('');
  const [msg, setMsg] = useState('');
  const notify = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };

  const inp = "w-full px-3 py-2 rounded-xl text-sm font-rubik outline-none";
  const ist = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,214,0,0.3)', color: 'white' as const };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="font-orbitron font-bold text-xl" style={{ color: '#ffd700' }}>🦉 ПАНЕЛЬ СОВЫ</div>
      {msg && <div className="px-4 py-2.5 rounded-xl text-sm text-center font-rubik" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>{msg}</div>}
      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,214,0,0.3)' }}>
        <div className="font-orbitron text-sm" style={{ color: '#ffd700' }}>🔒 БЛОКИРОВКА</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={bTarget} onChange={e => setBTarget(e.target.value)} />
        <input className={inp} style={ist} placeholder="Минуты" type="number" value={bMins} onChange={e => setBMins(e.target.value)} />
        <input className={inp} style={ist} placeholder="Причина" value={bReason} onChange={e => setBReason(e.target.value)} />
        <button onClick={() => {
          const u = users.find(u => u.username.toLowerCase() === bTarget.toLowerCase());
          if (!u) { notify('Не найден'); return; } if (u.isSpecial) { notify('Нельзя'); return; }
          setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === bTarget.toLowerCase() ? { ...u, isBlocked: true, blockedUntil: Date.now() + parseInt(bMins) * 60000, blockReason: bReason } : u) }));
          notify(`✅ ${bTarget} заблокирован`); setBTarget(''); setBReason('');
        }} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>ЗАБЛОКИРОВАТЬ</button>
      </div>
      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,214,0,0.3)' }}>
        <div className="font-orbitron text-sm" style={{ color: '#ffd700' }}>📢 НАПИСАТЬ ВСЕМ</div>
        <input className={inp} style={ist} placeholder="Сообщение..." value={gMsg} onChange={e => setGMsg(e.target.value)} />
        <button onClick={() => {
          if (!gMsg.trim()) return;
          setState(s => ({ ...s, globalMessage: { id: `gm-${Date.now()}`, text: gMsg, fromName: '🦉 СОВА_ПРО', color: 'linear-gradient(90deg,rgba(255,200,0,0.9),rgba(255,100,0,0.9))', timestamp: Date.now() } }));
          notify('✅ Отправлено'); setGMsg('');
        }} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,200,0,0.2)', color: '#ffd700', border: '1px solid rgba(255,200,0,0.4)' }}>ОТПРАВИТЬ ОТ 🦉 СОВЫ</button>
      </div>
      <button onClick={() => setState(s => ({ ...s, activeEvent: s.activeEvent === 'owls' ? null : 'owls' }))}
        className="w-full py-3 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,214,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,214,0,0.4)', boxShadow: '0 0 20px rgba(255,214,0,0.2)' }}>
        🦉 ПРИЗВАТЬ СОВУ (ИВЕНТ)
      </button>
    </div>
  );
}

// ─── MARY PANEL ─────────────────────────────────────────────────────
function MaryPanel() {
  const users = useStore(s => s.users);
  const [bTarget, setBTarget] = useState(''); const [bMins, setBMins] = useState('60'); const [bReason, setBReason] = useState('');
  const [cTarget, setCTarget] = useState(''); const [cAmount, setCAmount] = useState('10');
  const [gMsg, setGMsg] = useState('');
  const [msg, setMsg] = useState('');
  const notify = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000); };
  const activeEvent = useStore(s => s.activeEvent);

  const inp = "w-full px-3 py-2 rounded-xl text-sm font-rubik outline-none";
  const ist = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,0,204,0.3)', color: 'white' as const };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="font-orbitron font-bold text-xl" style={{ color: 'var(--neon-pink)' }}>🌸 ПАНЕЛЬ МАРИИ</div>
      {msg && <div className="px-4 py-2.5 rounded-xl text-sm text-center font-rubik" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>{msg}</div>}

      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,0,204,0.3)' }}>
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-pink)' }}>🔒 БЛОКИРОВКА</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={bTarget} onChange={e => setBTarget(e.target.value)} />
        <input className={inp} style={ist} placeholder="Минуты" type="number" value={bMins} onChange={e => setBMins(e.target.value)} />
        <input className={inp} style={ist} placeholder="Причина" value={bReason} onChange={e => setBReason(e.target.value)} />
        <button onClick={() => {
          const u = users.find(u => u.username.toLowerCase() === bTarget.toLowerCase());
          if (!u) { notify('Не найден'); return; } if (u.isSpecial) { notify('Нельзя'); return; }
          setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === bTarget.toLowerCase() ? { ...u, isBlocked: true, blockedUntil: Date.now() + parseInt(bMins) * 60000, blockReason: bReason } : u) }));
          notify(`✅ ${bTarget} заблокирован`); setBTarget(''); setBReason('');
        }} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.4)' }}>ЗАБЛОКИРОВАТЬ</button>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,0,204,0.3)' }}>
        <div className="font-orbitron text-sm" style={{ color: '#ffd700' }}>🪙 МОНЕТКИ</div>
        <input className={inp} style={ist} placeholder="Никнейм" value={cTarget} onChange={e => setCTarget(e.target.value)} />
        <input className={inp} style={ist} placeholder="Кол-во" type="number" value={cAmount} onChange={e => setCAmount(e.target.value)} />
        <button onClick={() => {
          const u = users.find(u => u.username.toLowerCase() === cTarget.toLowerCase());
          if (!u) { notify('Не найден'); return; }
          setState(s => ({ ...s, users: s.users.map(u => u.username.toLowerCase() === cTarget.toLowerCase() ? { ...u, coins: u.coins + parseInt(cAmount) } : u) }));
          notify(`✅ Выдано ${cAmount} монеток`); setCTarget('');
        }} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,214,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,214,0,0.4)' }}>ВЫДАТЬ</button>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ border: '1px solid rgba(255,0,204,0.3)' }}>
        <div className="font-orbitron text-sm" style={{ color: 'var(--neon-pink)' }}>📢 НАПИСАТЬ ВСЕМ</div>
        <input className={inp} style={ist} placeholder="Сообщение..." value={gMsg} onChange={e => setGMsg(e.target.value)} />
        <button onClick={() => {
          if (!gMsg.trim()) return;
          setState(s => ({ ...s, globalMessage: { id: `gm-${Date.now()}`, text: gMsg, fromName: '🌸 Mary', color: 'linear-gradient(90deg,rgba(255,0,204,0.9),rgba(255,100,150,0.9))', timestamp: Date.now() } }));
          notify('✅ Отправлено'); setGMsg('');
        }} className="w-full py-2.5 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,0,204,0.15)', color: 'var(--neon-pink)', border: '1px solid rgba(255,0,204,0.4)' }}>ОТПРАВИТЬ ОТ 🌸 MARY</button>
      </div>

      <button onClick={() => { setState(s => ({ ...s, activeEvent: s.activeEvent === 'roses' ? null : 'roses' })); }}
        className="w-full py-3 rounded-xl text-sm font-orbitron" style={{ background: 'rgba(255,0,204,0.15)', color: 'var(--neon-pink)', border: '1px solid rgba(255,0,204,0.4)', boxShadow: '0 0 20px rgba(255,0,204,0.2)' }}>
        {activeEvent === 'roses' ? '🌹 ЗАВЕРШИТЬ ИВЕНТ РОЗ' : '🌹 ПРИЗВАТЬ ИВЕНТ РОЗ'}
      </button>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────
type Tab = 'home' | 'chats' | 'games' | 'shop' | 'profile' | 'announcements' | 'admin' | 'sova' | 'mary';

function MainApp() {
  const me = getCurrentUser()!;
  const [tab, setTab] = useState<Tab>('home');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
    { id: 'games', icon: 'Gamepad2', label: 'Игры' },
    { id: 'shop', icon: 'ShoppingBag', label: 'Магазин' },
    { id: 'announcements', icon: 'Bell', label: 'Анонсы' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
  ];
  if (me.isSpecial === 'mrlis') navItems.push({ id: 'admin', icon: 'Shield', label: 'Админ' });
  if (me.isSpecial === 'sova') navItems.push({ id: 'sova', icon: 'Eye', label: 'Сова' });
  if (me.isSpecial === 'mary') navItems.push({ id: 'mary', icon: 'Flower2', label: 'Мария' });

  const handleOpenChat = (chat: Chat) => { setActiveChat(chat); setTab('chats'); };

  const renderPage = () => {
    switch (tab) {
      case 'home': return <HomePage onNavigate={(t) => setTab(t as Tab)} />;
      case 'games': return <GamesPage />;
      case 'shop': return <ShopPage />;
      case 'profile': return <ProfilePage />;
      case 'announcements': return <AnnouncementsPage onOpenChat={handleOpenChat} />;
      case 'admin': return <AdminPanel />;
      case 'sova': return <SovaPanel />;
      case 'mary': return <MaryPanel />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-dark)' }}>
      <GlobalBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-64 border-r flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'rgba(5,5,20,0.95)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(184,79,255,0.2)' }}>
            <div className="font-orbitron font-black text-2xl gradient-text">LiMark</div>
            <div className="text-xs text-muted-foreground mt-1 font-rubik">{me.avatar} {me.username}</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setTab(item.id); setActiveChat(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left"
                style={tab === item.id ? { background: 'rgba(184,79,255,0.15)', color: 'var(--neon-purple)', borderRight: '2px solid var(--neon-purple)' } : { color: '#666' }}>
                <Icon name={item.icon as 'Home'} size={18} />
                <span className="font-rubik text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {tab === 'chats' && (
            <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 border-r flex-shrink-0`}
              style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'rgba(8,8,22,0.95)' }}>
              <ChatsPanel onSelectChat={setActiveChat} />
            </div>
          )}
          <div className={`flex-1 overflow-y-auto ${tab === 'chats' && !activeChat ? 'hidden md:flex md:items-center md:justify-center' : 'flex flex-col'}`}>
            {tab === 'chats' && activeChat
              ? <ChatView chat={activeChat} onBack={() => setActiveChat(null)} />
              : tab === 'chats'
                ? <div className="hidden md:block text-muted-foreground font-rubik text-sm">Выбери чат слева</div>
                : <div className="flex-1 overflow-y-auto">{renderPage()}</div>}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden border-t flex flex-shrink-0" style={{ borderColor: 'rgba(184,79,255,0.2)', background: 'rgba(5,5,20,0.98)', backdropFilter: 'blur(20px)' }}>
        {navItems.slice(0, navItems.length > 6 ? 6 : navItems.length).map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setActiveChat(null); }}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all duration-200"
            style={{ color: tab === item.id ? 'var(--neon-purple)' : '#444' }}>
            <Icon name={item.icon as 'Home'} size={18} />
            <span className="font-rubik" style={{ fontSize: '8px' }}>{item.label}</span>
          </button>
        ))}
        {navItems.length > 6 && (
          <button onClick={() => { setTab(navItems[navItems.length - 1].id); setActiveChat(null); }}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5"
            style={{ color: tab === navItems[navItems.length - 1].id ? 'var(--neon-purple)' : '#444' }}>
            <Icon name={navItems[navItems.length - 1].icon as 'Shield'} size={18} />
            <span className="font-rubik" style={{ fontSize: '8px' }}>{navItems[navItems.length - 1].label}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<'loading' | 'auth' | 'app'>('loading');
  const currentUserId = useStore(s => s.currentUserId);
  const onLoadDone = useCallback(() => setPhase(getState().currentUserId ? 'app' : 'auth'), []);

  useEffect(() => {
    if (phase !== 'loading') {
      if (currentUserId) setPhase('app');
      else setPhase('auth');
    }
  }, [currentUserId, phase]);

  if (phase === 'loading') return <LoadingScreen onDone={onLoadDone} />;
  if (!currentUserId) return <AuthScreen />;
  return <MainApp />;
}
