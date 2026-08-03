import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useUser } from './UserContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigate, useLocation } from 'react-router-dom';

const AIContext = createContext();

const INITIAL_MSG = {
  role: 'model',
  content: 'Привет! Я твой бизнес-ассистент. Могу помочь создать акцию, проанализировать продажи, добавить клиента или просто сориентировать по платформе. Что будем делать сегодня?'
};

// Объявление функций для Gemini Function Calling
const functionDeclarations = [
  {
    name: 'navigateToPage',
    description: 'Перенаправить пользователя на определенную страницу платформы.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description: 'Путь для перехода (например, /promotions, /analytics, /customers, /gamification, /settings)',
        },
      },
      required: ['path'],
    },
  },
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
        discount: {
          type: 'NUMBER',
          description: 'Размер скидки в процентах (если применимо)',
        }
      },
      required: ['title', 'type'],
    },
  },
  {
    name: 'addCustomer',
    description: 'Добавить нового клиента в базу CRM.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Имя клиента',
        },
        email: {
          type: 'STRING',
          description: 'Email клиента',
        },
        phone: {
          type: 'STRING',
          description: 'Номер телефона клиента',
        },
        segment: {
          type: 'STRING',
          description: 'Сегмент (new, active, sleeping)',
        }
      },
      required: ['name'],
    },
  },
  {
    name: 'getDashboardStats',
    description: 'Получить текущую статистику платформы (выручка, количество клиентов, активные акции).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    }
  }
];

export const AIProvider = ({ children }) => {
  const { isAuthenticated } = useAuth() || {};
  const { userProfile, stats, addPromotion, addCustomer } = useUser() || {};

  // Безопасно получаем контекст уведомлений
  const notificationContext = useNotification?.() || {};
  const addNotification = notificationContext?.addNotification || notificationContext?.notify || null;

  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemAction, setSystemAction] = useState(null);

  const chatSessionRef = useRef(null);

  // Функция для инициализации Gemini
  const createChatSession = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API ключ VITE_GEMINI_API_KEY не найден в файле .env. Проверь конфигурацию и перезапусти сервер dev.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Формируем системную инструкцию
    const systemInstruction = `Ты — полезный ИИ-ассистент платформы управления бизнесом.
Тебя зовут Serpin Agent.
Пользователь: ${userProfile?.name || 'Владелец бизнеса'}.
Текущая страница пользователя: ${location.pathname}.

Ты можешь выполнять действия с помощью функций:
- Навигация (navigateToPage)
- Создание акций (createPromotion)
- Добавление клиентов (addCustomer)
- Просмотр статистики (getDashboardStats)

Если пользователь просит создать что-то, используй соответствующую функцию, а затем сообщи пользователю результат. Всегда отвечай на русском языке дружелюбным тоном.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      tools: [{ functionDeclarations }],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
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

  // Инициализация
  useEffect(() => {
    try {
      if (import.meta.env.VITE_GEMINI_API_KEY && isAuthenticated) {
        chatSessionRef.current = createChatSession();
      }
    } catch (error) {
      console.warn("Предварительная инициализация ИИ пропущена:", error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, location.pathname]);
  // Мы можем пересоздавать сессию при смене страницы, чтобы обновить контекст местоположения в prompt,
  // Но пока оставим как есть, просто чтобы он знал при логине, где он.

  const executeFunctionCall = async (functionCall) => {
    const { name, args } = functionCall;
    let actionText = '';
    let responseData = null;
    let status = "success";

    try {
      if (name === 'createPromotion') {
        actionText = `Создаю акцию: ${args?.title || ''}...`;
        setSystemAction(actionText);

        const promoData = {
          title: args.title,
          type: args.type || 'discount',
          budget: args.budget || 0,
          discount: args.discount || 0,
          status: 'active'
        };

        if (addPromotion) {
          const res = await addPromotion(promoData);
          responseData = { message: "Акция успешно создана", data: res?.data || res };
        } else {
          throw new Error("Функция addPromotion недоступна");
        }

      } else if (name === 'navigateToPage') {
        actionText = `Перехожу на страницу: ${args?.path || ''}...`;
        setSystemAction(actionText);

        if (typeof navigate === 'function') {
          navigate(args?.path || '/');
          responseData = { message: `Успешный переход на ${args.path}` };
        } else {
          throw new Error("Функция навигации недоступна");
        }

      } else if (name === 'addCustomer') {
        actionText = `Добавляю клиента: ${args?.name || ''}...`;
        setSystemAction(actionText);

        const customerData = {
          name: args.name,
          email: args.email || '',
          phone: args.phone || '',
          segment: args.segment || 'new',
          status: 'active'
        };

        if (addCustomer) {
          const res = await addCustomer(customerData);
          responseData = { message: "Клиент успешно добавлен", data: res?.data || res };
        } else {
          throw new Error("Функция addCustomer недоступна");
        }

      } else if (name === 'getDashboardStats') {
        actionText = `Загружаю статистику...`;
        setSystemAction(actionText);
        responseData = { stats: stats || {} };
      }
    } catch (error) {
      console.error(`Ошибка при выполнении ${name}:`, error);
      status = "error";
      responseData = { error: error.message || "Произошла неизвестная ошибка" };
    }

    setSystemAction(null);

    return {
      functionResponse: {
        name,
        response: { name, content: { status, data: responseData } }
      }
    };
  };

  const sendMessage = async (text) => {
    if (!text?.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => (Array.isArray(prev) ? [...prev, userMsg] : [userMsg]));
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }

      const result = await chatSessionRef.current.sendMessage(text);
      let response = result?.response;

      let calls = response?.functionCalls();
      // Выполняем функции в цикле, если ИИ решает вызвать их несколько подряд
      while (Array.isArray(calls) && calls.length > 0) {
        const functionCall = calls[0]; // Пока поддерживаем последовательное выполнение
        const functionResult = await executeFunctionCall(functionCall);

        // Отправляем результат обратно ИИ
        const nextResult = await chatSessionRef.current.sendMessage([functionResult]);
        response = nextResult?.response;
        calls = response?.functionCalls();
      }

      const textContent = response?.text() || "Не удалось получить текстовый ответ.";
      const aiMsg = { role: 'model', content: textContent };
      setMessages(prev => (Array.isArray(prev) ? [...prev, aiMsg] : [aiMsg]));

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

  const generatePromoWithAI = async (prompt) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API ключ не найден");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      const promptText = `Сгенерируй рекламную акцию для бизнеса по запросу: "${prompt}". 
      Верни ответ СТРОГО в формате JSON со следующими полями:
      - title (строка, броское название акции)
      - typeId (число: 1 для скидки, 2 для штампов, 3 для счастливых часов, 4 для возврата)
      - budget (число, примерный бюджет продвижения в тенге, например 5000)
      Никакого другого текста, только валидный JSON.`;

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Promo gen error", e);
      throw e;
    }
  };

  const generateDashboardAdvice = async (statsData) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API ключ не найден");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      const promptText = `Ты бизнес-аналитик. Статистика бизнеса: ${JSON.stringify(statsData)}. 
      Выдай ровно 2 бизнес-рекомендации на основе этих данных.
      Верни СТРОГО JSON-массив строк (не объекты, просто строки). Пример: ["Рекомендация 1", "Рекомендация 2"]. 
      Никакого другого текста, только валидный JSON массив.`;

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Dashboard advice error", e);
      throw e;
    }
  };

  return (
    <AIContext.Provider value={{
      messages: Array.isArray(messages) ? messages : [],
      isTyping,
      systemAction,
      sendMessage,
      clearHistory,
      generatePromoWithAI,
      generateDashboardAdvice
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
      clearHistory: () => { },
      generatePromoWithAI: async () => null,
      generateDashboardAdvice: async () => null
    };
  }
  return context;
};
