import React, { createContext, useState, useContext } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Привет! Я твой бизнес-ассистент. Могу помочь создать акцию, проанализировать продажи или написать пост для соцсетей. Что будем делать сегодня?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "Я могу помочь с этим. Давайте настроим!";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('акци') || lowerText.includes('скидк')) {
        aiResponse = "Отличная идея для акции! Рекомендую запустить скидку на повторный визит или акцию '2+1'. Я могу автоматически сгенерировать текст для Kaspi и Instagram. Сделать это?";
      } else if (lowerText.includes('kaspi') || lowerText.includes('каспи')) {
        aiResponse = "Для интеграции с Kaspi, вам нужно настроить выгрузку товаров. У нас есть готовый модуль в разделе 'Инструменты'.";
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AIContext.Provider value={{ messages, isTyping, sendMessage }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
