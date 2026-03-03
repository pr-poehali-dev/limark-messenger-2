import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type Role = 'admin' | 'moder' | 'vip' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  coins: number;
  avatar: string;
  stickers: string[];
  blocked?: { until: number; reason: string } | null;
  specialPanel?: 'admin' | 'sova' | 'mary';
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  voice?: string;
  sticker?: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'sticker';
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  isChannel?: boolean;
  channelName?: string;
  channelAdmin?: string;
}

export interface GlobalBanner {
  text: string;
  author: string;
  color: string;
}

export interface Event {
  type: 'owls' | 'flowers' | null;
  active: boolean;
}

const INITIAL_USERS: User[] = [
  {
    id: 'mrlis',
    username: 'MrLis',
    password: '1q2w3e4r5t',
    role: 'admin',
    coins: 9999,
    avatar: '🦊',
    stickers: ['😀','🎮','🔥','💎','⚡'],
    specialPanel: 'admin',
  },
  {
    id: 'sova_pro',
    username: 'Сова_Про',
    password: '340',
    role: 'vip',
    coins: 500,
    avatar: '🦉',
    stickers: ['🦉','⭐','🌙'],
    specialPanel: 'sova',
  },
  {
    id: 'mary',
    username: 'Mary',
    password: '17112014',
    role: 'vip',
    coins: 500,
    avatar: '🌹',
    stickers: ['🌹','🌷','🌸'],
    specialPanel: 'mary',
  },
];

const LIMARK_CHANNEL: Chat = {
  id: 'limark-channel',
  participants: [],
  isChannel: true,
  channelName: 'LiMark Анонсы',
  channelAdmin: 'mrlis',
  messages: [
    {
      id: 'ch1',
      senderId: 'mrlis',
      text: '👋 Добро пожаловать в официальный канал LiMark! Здесь будут все анонсы и обновления.',
      timestamp: Date.now() - 3600000,
      type: 'text',
    },
    {
      id: 'ch2',
      senderId: 'mrlis',
      text: '🚀 LiMark v1.0 запущен! Наслаждайтесь неоновым мессенджером нового поколения.',
      timestamp: Date.now() - 1800000,
      type: 'text',
    },
  ],
};

interface AppContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  globalBanner: GlobalBanner | null;
  setGlobalBanner: React.Dispatch<React.SetStateAction<GlobalBanner | null>>;
  activeEvent: Event;
  setActiveEvent: React.Dispatch<React.SetStateAction<Event>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  activeChatId: string | null;
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
  sendMessage: (chatId: string, msg: Omit<Message, 'id' | 'timestamp'>) => void;
  getOrCreateChat: (userId: string) => string;
  registerUser: (username: string, password: string) => string | null;
  login: (username: string, password: string) => string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('limark_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('limark_current');
    return saved ? JSON.parse(saved) : null;
  });
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('limark_chats');
    return saved ? JSON.parse(saved) : [LIMARK_CHANNEL];
  });
  const [globalBanner, setGlobalBanner] = useState<GlobalBanner | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event>({ type: null, active: false });
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('limark_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('limark_chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('limark_current', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('limark_current');
    }
  }, [currentUser]);

  const sendMessage = (chatId: string, msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
  };

  const getOrCreateChat = (userId: string): string => {
    if (!currentUser) return '';
    const existing = chats.find(c =>
      !c.isChannel &&
      c.participants.includes(currentUser.id) &&
      c.participants.includes(userId)
    );
    if (existing) return existing.id;
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      participants: [currentUser.id, userId],
      messages: [],
    };
    setChats(prev => [...prev, newChat]);
    return newChat.id;
  };

  const registerUser = (username: string, password: string): string | null => {
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return 'Никнейм уже занят';
    }
    if (username.length < 3) return 'Никнейм слишком короткий';
    if (password.length < 3) return 'Пароль слишком короткий';
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      password,
      role: 'user',
      coins: 50,
      avatar: '👤',
      stickers: ['😀'],
      blocked: null,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return null;
  };

  const login = (username: string, password: string): string | null => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return 'Пользователь не найден';
    if (user.password !== password) return 'Неверный пароль';
    if (user.blocked && user.blocked.until > Date.now()) {
      const mins = Math.ceil((user.blocked.until - Date.now()) / 60000);
      return `Заблокирован на ${mins} мин. Причина: ${user.blocked.reason}`;
    }
    setCurrentUser(user);
    return null;
  };

  return (
    <AppContext.Provider value={{
      users, setUsers, currentUser, setCurrentUser,
      chats, setChats, globalBanner, setGlobalBanner,
      activeEvent, setActiveEvent,
      activeTab, setActiveTab,
      activeChatId, setActiveChatId,
      sendMessage, getOrCreateChat, registerUser, login,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
