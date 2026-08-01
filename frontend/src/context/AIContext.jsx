import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigate } from 'react-router-dom';

const AIContext = createContext();

const INITIAL_MSG = {
  role: 'model',
  content: 'Привет! Я твой бизнес-ассистент. Могу помочь создать акцию, проанализировать продажи или написать пост для соцсетей. Что будем делать сегодня?'
};

// Объявление функций для Gemini Function Calling
const functionDeclarations = [
  {
    name: 'createPromotion',
    description: 'Создать новую акцию или маркетинговую кампанию.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Название акции (например, "Скидка 20% на кофе")',
        },
        type: {
          type: 'STRING',
          description: 'Тип акции (discount, bonus, gift, etc.)',
        },
        budget: {
          type: 'NUMBER',
          description: 'Предполагаемый бюджет акции',
        },
      },
      required: ['title', 'type', 'budget'],
    },
  },
  {
    name: 'navigateToPage',
    description: 'Перенаправить пользователя на определенную страницу платформы.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description: 'Путь для перехода (например, /promotions, /analytics, /customers, /gamification)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'filterCustomers',
    description: 'Отфильтровать или сегментировать список клиентов.',
    parameters: {
      type: 'OBJECT',
      properties: {
        segment: {
          type: 'STRING',
          description: 'Название сегмента (например, "активные", "новые", "спящие")',
        },
      },
      required: ['segment'],
    },
  }
];

export const AIProvider = ({ children }) => {
  const { isAuthenticated } = useAuth() || {};

  // Безопасно получаем контекст уведомлений
  const notificationContext = useNotification?.() || {};
  const addNotification = notificationContext?.addNotification || notificationContext?.notify || null;

  const navigate = useNavigate();

  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemAction, setSystemAction] = useState(null);

  const chatSessionRef = useRef(null);

  // Функция для инициализации Gemini
  const createChatSession = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Gemini Key Status:", !!apiKey);
    if (!apiKey) {
      throw new Error("API ключ VITE_GEMINI_API_KEY не найден в файле .env. Проверь конфигурацию и перезапусти сервер dev.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ functionDeclarations }]
    });

    return model.startChat({ history: [] });
  };

  // Безопасный вызов уведомлений
  const safeNotify = (msg, type = 'info') => {
    if (typeof addNotification === 'function') {
      try {
        addNotification(msg, type);
      } catch (e) {
        try {
          addNotification({ message: msg, type });
        } catch (err) {
          console.log(`[Notification - ${type}]: ${msg}`);
        }
      }
    } else {
      console.log(`[AI Notification - ${type}]: ${msg}`);
    }
  };

  useEffect(() => {
    try {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        chatSessionRef.current = createChatSession();
      }
    } catch (error) {
      console.warn("Предварительная инициализация ИИ пропущена:", error.message);
    }
  }, [isAuthenticated]);

  const executeFunctionCall = async (functionCall) => {
    const { name, args } = functionCall;
    let actionText = '';

    if (name === 'createPromotion') {
      actionText = `Создаю акцию: ${args?.title || ''}...`;
      setSystemAction(actionText);
      await new Promise(res => setTimeout(res, 1200));
      safeNotify("Акция успешно сгенерирована!", "success");
      if (typeof navigate === 'function') navigate('/promotions');

    } else if (name === 'navigateToPage') {
      actionText = `Перехожу на страницу: ${args?.path || ''}...`;
      setSystemAction(actionText);
      await new Promise(res => setTimeout(res, 800));
      if (typeof navigate === 'function') navigate(args?.path || '/');

    } else if (name === 'filterCustomers') {
      actionText = `Применяю фильтр сегмента: ${args?.segment || ''}...`;
      setSystemAction(actionText);
      await new Promise(res => setTimeout(res, 1200));
      if (typeof navigate === 'function') navigate('/customers');
    }

    setTimeout(() => setSystemAction(null), 1000);

    return {
      functionResponse: {
        name,
        response: { status: "success", executed: true }
      }
    };
  };

  const sendMessage = async (text) => {
    if (!text?.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => (Array.isArray(prev) ? [...prev, userMsg] : [userMsg]));
    setIsTyping(true);

    try {
      // Страховка: если сессия не создалась ранее, создаем её прямо сейчас
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }

      const result = await chatSessionRef.current.sendMessage(text);
      const response = result?.response;

      const calls = response?.functionCalls();
      if (Array.isArray(calls) && calls.length > 0) {
        const functionCall = calls[0];
        const functionResult = await executeFunctionCall(functionCall);

        const finalResult = await chatSessionRef.current.sendMessage([functionResult]);
        const finalResponse = finalResult?.response;

        const aiMsg = { role: 'model', content: finalResponse?.text() || "Действие выполнено." };
        setMessages(prev => (Array.isArray(prev) ? [...prev, aiMsg] : [aiMsg]));
      } else {
        const textContent = response?.text() || "Не удалось получить ответ.";
        const aiMsg = { role: 'model', content: textContent };
        setMessages(prev => (Array.isArray(prev) ? [...prev, aiMsg] : [aiMsg]));
      }

    } catch (error) {
      console.error("AI chat error:", error);

      let errorMessage = `Ошибка: ${error.message}`;
      if (error?.status === 429 || String(error?.message).includes('429') || String(error?.message).includes('Quota')) {
        errorMessage = "Превышен лимит запросов к AI API. Попробуйте через минуту.";
      }

      safeNotify(errorMessage !== `Ошибка: ${error.message}` ? errorMessage : (error.message || "Не удалось получить ответ от AI"), "error");

      setMessages(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return [...arr, { role: 'model', content: errorMessage }];
      });
    } finally {
      setIsTyping(false);
      setSystemAction(null);
    }
  };

  const clearHistory = async () => {
    try {
      chatSessionRef.current = createChatSession();
      setMessages([INITIAL_MSG]);
      safeNotify("История чата очищена", "success");
    } catch (error) {
      console.error("Failed to clear chat", error);
      safeNotify("Не удалось очистить историю", "error");
    }
  };

  return (
    <AIContext.Provider value={{
      messages: Array.isArray(messages) ? messages : [],
      isTyping,
      systemAction,
      sendMessage,
      clearHistory
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    return {
      messages: [INITIAL_MSG],
      isTyping: false,
      systemAction: null,
      sendMessage: () => { },
      clearHistory: () => { }
    };
  }
  return context;
};

export default AIContext;