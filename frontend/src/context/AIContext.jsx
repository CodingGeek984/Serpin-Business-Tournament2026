import React, { createContext, useState, useContext } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);

  const sendMessage = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      let activeChatId = chatId;
      if (!activeChatId) {
        const chat = await api('/ai/chats', { method: 'POST', token, body: { title: text.slice(0, 60) } });
        activeChatId = chat.id;
        setChatId(activeChatId);
      }
      const result = await api(`/ai/chats/${activeChatId}/messages`, { method: 'POST', token, body: { text } });
      setMessages(prev => [...prev, { role: 'ai', content: result.reply.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: `Не удалось получить ответ: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AIContext.Provider value={{ messages, isTyping, sendMessage }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
