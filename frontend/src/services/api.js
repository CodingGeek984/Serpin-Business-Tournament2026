import axios from 'axios';

// Используем 127.0.0.1 явно для обхода проблем IPv6 в Windows 11
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  withCredentials: true, // Обязательно для CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем Interceptor для подстановки токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем Interceptor для обработки ответов
api.interceptors.response.use(
  (response) => {
    // Process Gamification Rewards globally
    if (response.data && response.data.gamification_rewards) {
      import('react-hot-toast').then(({ default: toast }) => {
        response.data.gamification_rewards.forEach((reward) => {
          if (reward.type === 'ACHIEVEMENT_UNLOCKED') {
            toast.success(
              `Достижение: ${reward.title}!\n+${reward.reward_points} баллов\n${reward.description}`,
              {
                icon: '🏆',
                duration: 5000,
                style: {
                  background: '#4f46e5',
                  color: '#fff',
                  fontWeight: 'bold',
                },
              }
            );
          } else if (reward.type === 'TASK_COMPLETED') {
            toast.success(`${reward.title} (+${reward.reward_points}XP)`, {
              duration: 4000,
            });
          }

          if (reward.level_up) {
            toast.success('Поздравляем! Вы достигли НОВОГО УРУМНЯ! 🚀', {
              duration: 6000,
            });
          }
        });
      });
    }

    return response;
  },
  (error) => {
    // 🛑 ИСПРАВЛЕНИЕ: Проверяем, не является ли текущий запрос авторизацией/регистрацией
    const requestUrl = error.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/register') || requestUrl.includes('/auth/login');

    // Автоматический редирект на логин при 401 Unauthorized
    // Выполняем РЕДИРЕКТ ТОЛЬКО для защищенных роутов!
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      console.warn('Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Форматируем ошибку для UI
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Произошла ошибка сервера';
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.details = error.response?.data;

    // Глобальное Toast-уведомление для ошибок сервера (400/500)
    if (customError.status >= 400 && customError.status !== 401) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(`Ошибка: ${errorMessage}`, {
          duration: 5000,
          position: 'top-right',
        });
      });
    }

    return Promise.reject(customError);
  }
);

export default api;
