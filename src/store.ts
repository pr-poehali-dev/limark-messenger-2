export type UserRole = 'user' | 'admin' | 'moderator' | 'vip';

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  price: number;
  isLimited?: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
  role: UserRole;
  coins: number;
  stickers: string[];
  isBlocked: boolean;
  blockedUntil?: number;
  blockReason?: string;
  createdAt: number;
  isSpecial?: 'mrlis' | 'sova' | 'mary';
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  stickerEmoji?: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'sticker';
}

export interface Chat {
  id: string;
  type: 'direct' | 'channel';
  name?: string;
  participants: string[];
  lastMessage?: string;
  lastTime?: number;
  adminId?: string;
  avatar?: string;
  isChannel?: boolean;
}

export interface GlobalMessage {
  id: string;
  text: string;
  fromName: string;
  color: string;
  timestamp: number;
}

export interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  price: number;
  isLimited?: boolean;
  description: string;
}

export interface AppState {
  currentUserId: string | null;
  users: User[];
  chats: Chat[];
  messages: Message[];
  globalMessage: GlobalMessage | null;
  activeEvent: 'owls' | 'roses' | null;
  shopItems: ShopItem[];
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', emoji: '😎', name: 'Крутяш', price: 5, description: 'Стикер крутого чела' },
  { id: 's2', emoji: '🔥', name: 'Огонь', price: 5, description: 'Огненный стикер' },
  { id: 's3', emoji: '💎', name: 'Бриллиант', price: 15, description: 'Редкий стикер' },
  { id: 's4', emoji: '⚡', name: 'Молния', price: 10, description: 'Стикер молнии' },
  { id: 's5', emoji: '🌟', name: 'Звезда', price: 8, description: 'Яркая звезда' },
  { id: 's6', emoji: '🎮', name: 'Геймер', price: 12, description: 'Для настоящих геймеров' },
  { id: 's7', emoji: '🦋', name: 'Бабочка', price: 10, description: 'Красивая бабочка' },
  { id: 's8', emoji: '🎯', name: 'Цель', price: 8, description: 'Бить в цель' },
  { id: 's9', emoji: '🌹', name: 'Роза [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированный цветок' },
  { id: 's10', emoji: '🌺', name: 'Гибискус [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированный тропик' },
  { id: 's11', emoji: '🏵', name: 'Венок [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированный венок' },
  { id: 's12', emoji: '🌷', name: 'Тюльпан [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированный тюльпан' },
  { id: 's13', emoji: '🌸', name: 'Сакура [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированная сакура' },
  { id: 's14', emoji: '🪻', name: 'Лаванда [ЛИМ]', price: 50, isLimited: true, description: 'Лимитированная лаванда' },
  { id: 's15', emoji: '🦉', name: 'Сова [ЛИМ]', price: 30, isLimited: true, description: 'Лимитированная сова' },
  { id: 's16', emoji: '🚀', name: 'Ракета', price: 20, description: 'Поехали в космос!' },
  { id: 's17', emoji: '🎭', name: 'Театр', price: 15, description: 'Маски театра' },
  { id: 's18', emoji: '🌊', name: 'Волна', price: 10, description: 'Морская волна' },
];

const INITIAL_CHANNEL_ID = 'channel-limark-announcements';

const INITIAL_USERS: User[] = [
  {
    id: 'user-mrlis',
    username: 'MrLis',
    password: '1q2w3e4r5t',
    avatar: '🦊',
    role: 'admin',
    coins: 9999,
    stickers: ['s1', 's2', 's3', 's16'],
    isBlocked: false,
    createdAt: Date.now() - 1000000,
    isSpecial: 'mrlis',
  },
  {
    id: 'user-sova',
    username: 'Сова_Про',
    password: '340',
    avatar: '🦉',
    role: 'vip',
    coins: 500,
    stickers: ['s1', 's15'],
    isBlocked: false,
    createdAt: Date.now() - 900000,
    isSpecial: 'sova',
  },
  {
    id: 'user-mary',
    username: 'Mary',
    password: '17112014',
    avatar: '🌸',
    role: 'vip',
    coins: 500,
    stickers: ['s9', 's10', 's11', 's12', 's13', 's14'],
    isBlocked: false,
    createdAt: Date.now() - 800000,
    isSpecial: 'mary',
  },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: INITIAL_CHANNEL_ID,
    type: 'channel',
    name: 'LiMark Анонсы',
    participants: ['user-mrlis', 'user-sova', 'user-mary'],
    adminId: 'user-mrlis',
    avatar: '📢',
    isChannel: true,
    lastMessage: 'Добро пожаловать в LiMark!',
    lastTime: Date.now() - 500000,
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome',
    chatId: INITIAL_CHANNEL_ID,
    senderId: 'user-mrlis',
    text: '🎉 Добро пожаловать в LiMark! Это официальный канал анонсов. Следите за обновлениями!',
    timestamp: Date.now() - 500000,
    type: 'text',
  },
  {
    id: 'msg-welcome2',
    chatId: INITIAL_CHANNEL_ID,
    senderId: 'user-mrlis',
    text: '⚡ LiMark — это новый мессенджер с мини-играми, магазином и уникальными возможностями. Наслаждайтесь!',
    timestamp: Date.now() - 400000,
    type: 'text',
  },
];

const STORAGE_KEY = 'limark_state_v2';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Merge default users (update passwords/roles if changed)
      const userMap = new Map(parsed.users.map(u => [u.id, u]));
      INITIAL_USERS.forEach(iu => {
        const existing = userMap.get(iu.id);
        if (existing) {
          userMap.set(iu.id, { ...existing, password: iu.password, isSpecial: iu.isSpecial, role: iu.role });
        } else {
          userMap.set(iu.id, iu);
        }
      });
      parsed.users = Array.from(userMap.values());

      // Ensure channel exists
      if (!parsed.chats.find(c => c.id === INITIAL_CHANNEL_ID)) {
        parsed.chats.unshift(INITIAL_CHATS[0]);
      } else {
        // Add new users to channel
        const channel = parsed.chats.find(c => c.id === INITIAL_CHANNEL_ID)!;
        parsed.users.forEach(u => {
          if (!channel.participants.includes(u.id)) {
            channel.participants.push(u.id);
          }
        });
      }

      return { ...parsed, shopItems: SHOP_ITEMS };
    }
  } catch (e) {
    console.warn('loadState error', e);
  }
  return {
    currentUserId: null,
    users: INITIAL_USERS,
    chats: INITIAL_CHATS,
    messages: INITIAL_MESSAGES,
    globalMessage: null,
    activeEvent: null,
    shopItems: SHOP_ITEMS,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState error', e);
  }
}

let _state: AppState = loadState();
let _listeners: Array<() => void> = [];

export function getState(): AppState {
  return _state;
}

export function setState(updater: (prev: AppState) => AppState) {
  _state = updater(_state);
  saveState(_state);
  _listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

// Helpers
export function getCurrentUser() {
  const s = getState();
  return s.users.find(u => u.id === s.currentUserId) ?? null;
}

export function getUserById(id: string) {
  return getState().users.find(u => u.id === id) ?? null;
}

export function getChatMessages(chatId: string) {
  return getState().messages.filter(m => m.chatId === chatId).sort((a, b) => a.timestamp - b.timestamp);
}

export function getUserChats(userId: string) {
  return getState().chats.filter(c => c.participants.includes(userId));
}

export function findDirectChat(userId1: string, userId2: string) {
  return getState().chats.find(c =>
    c.type === 'direct' &&
    c.participants.includes(userId1) &&
    c.participants.includes(userId2)
  ) ?? null;
}

export function createOrOpenDirectChat(userId1: string, userId2: string): string {
  const existing = findDirectChat(userId1, userId2);
  if (existing) return existing.id;
  const newChat: Chat = {
    id: `chat-${Date.now()}-${Math.random()}`,
    type: 'direct',
    participants: [userId1, userId2],
  };
  setState(s => ({ ...s, chats: [...s.chats, newChat] }));
  return newChat.id;
}

export function sendMessage(msg: Omit<Message, 'id'>) {
  const newMsg: Message = { ...msg, id: `msg-${Date.now()}-${Math.random()}` };
  setState(s => {
    const chats = s.chats.map(c => {
      if (c.id === msg.chatId) {
        return {
          ...c,
          lastMessage: msg.text || (msg.type === 'image' ? '📷 Фото' : msg.type === 'voice' ? '🎤 Голосовое' : msg.stickerEmoji || ''),
          lastTime: msg.timestamp,
        };
      }
      return c;
    });
    return { ...s, messages: [...s.messages, newMsg], chats };
  });
}

export function registerUser(username: string, password: string): { ok: boolean; error?: string } {
  const s = getState();
  if (s.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'Никнейм уже занят' };
  }
  if (username.length < 3) return { ok: false, error: 'Минимум 3 символа' };
  if (password.length < 3) return { ok: false, error: 'Пароль минимум 3 символа' };

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    password,
    avatar: ['🐱', '🐶', '🦊', '🐺', '🦁', '🐸', '🐙', '🦋', '🌟', '⚡'][Math.floor(Math.random() * 10)],
    role: 'user',
    coins: 10,
    stickers: [],
    isBlocked: false,
    createdAt: Date.now(),
  };
  setState(s => {
    const chats = s.chats.map(c => {
      if (c.id === INITIAL_CHANNEL_ID) {
        return { ...c, participants: [...c.participants, newUser.id] };
      }
      return c;
    });
    return { ...s, users: [...s.users, newUser], chats };
  });
  return { ok: true };
}

export function loginUser(username: string, password: string): { ok: boolean; error?: string } {
  const user = getState().users.find(u => u.username === username && u.password === password);
  if (!user) return { ok: false, error: 'Неверный никнейм или пароль' };
  if (user.isBlocked && user.blockedUntil && user.blockedUntil > Date.now()) {
    const mins = Math.ceil((user.blockedUntil - Date.now()) / 60000);
    return { ok: false, error: `Вы заблокированы на ${mins} мин. Причина: ${user.blockReason || 'нарушение правил'}` };
  }
  setState(s => ({ ...s, currentUserId: user.id }));
  return { ok: true };
}

export function logoutUser() {
  setState(s => ({ ...s, currentUserId: null }));
}

export function isUserBlocked(user: User): boolean {
  if (!user.isBlocked) return false;
  if (user.blockedUntil && user.blockedUntil < Date.now()) {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === user.id ? { ...u, isBlocked: false, blockedUntil: undefined, blockReason: undefined } : u)
    }));
    return false;
  }
  return true;
}