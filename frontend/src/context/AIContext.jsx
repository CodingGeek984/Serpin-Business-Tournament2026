import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const AIContext = createContext();

const INITIAL_MSG = { 
  role: 'ai', 
  content: 'Привет! Я твой бизнес-ассистент. Могу помочь создать акцию, проанализировать продажи или написать пост для соцсетей. Что будем делать сегодня?' 
};

export const AIProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);

  // Load existing chat or create a new one on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const initChat = async () => {
      try {
        const chatsRes = await api.get('/ai/chats');
        let currentChatId = null;

        if (chatsRes.data && chatsRes.data.length > 0) {
          currentChatId = chatsRes.data[0].id;
        } else {
          // Create new chat
          const newChatRes = await api.post('/ai/chats', { title: "Новый чат" });
          currentChatId = newChatRes.data?.id || newChatRes.id;
        }

        setChatId(currentChatId);

          if (currentChatId) {
            const msgsRes = await api.get(`/ai/chats/${currentChatId}/messages`);
            let history = msgsRes.data?.data || msgsRes.data || msgsRes;
            if (Array.isArray(history) && history.length > 0) {
              // Map old database fields (sender, text) to new format (role, content) for backward compatibility
              history = history.map(m => ({
                role: m.role || (m.sender === 'user' ? 'user' : 'ai'),
                content: m.content || m.text
              }));
              setMessages(history);
            } else {
              setMessages([INITIAL_MSG]);
            }
          }
        } catch (error) {
        console.error("Failed to initialize AI Chat", error);
      }
    };

    initChat();
  }, [isAuthenticated]);

  const sendMessage = async (text) => {
    // Add user message to UI immediately
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let targetChatId = chatId;
      // Fallback if chat creation failed initially
      if (!targetChatId) {
        const newChatRes = await api.post('/ai/chats', { title: "Новый чат" });
        targetChatId = newChatRes.data?.id || newChatRes.id;
        setChatId(targetChatId);
      }

      const response = await api.post(`/ai/chats/${targetChatId}/messages`, { content: text });
      // API returns { message: userMsg, reply: aiMsg }
      const data = response.data || response;
      const aiReply = data.reply;

      if (aiReply && aiReply.content) {
        setMessages(prev => [...prev, aiReply]);
      } else {
        throw new Error("Invalid response from AI");
      }

    } catch (error) {
      console.error("AI chat error", error);
      addNotification("Не удалось получить ответ от AI", "error");
      // Fallback to dummy answer if backend isn't ready
      setMessages(prev => [...prev, { role: 'ai', content: "Извините, сейчас я не могу подключиться к серверу AI. Попробуйте позже." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!chatId) return;
    try {
      await api.delete(`/ai/chats/${chatId}`);
      // Create new chat
      const newChatRes = await api.post('/ai/chats', { title: "Новый чат" });
      const newChatId = newChatRes.data?.id || newChatRes.id;
      setChatId(newChatId);
      setMessages([INITIAL_MSG]);
      addNotification("История чата очищена", "success");
    } catch (error) {
      console.error("Failed to clear chat", error);
      addNotification("Не удалось очистить историю", "error");
    }
  };

  return (
    <AIContext.Provider value={{ messages, isTyping, sendMessage, clearHistory }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
