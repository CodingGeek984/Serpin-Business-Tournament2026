import axios from 'axios';

// Настройка базового URL для API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
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
        response.data.gamification_rewards.forEach(reward => {
          if (reward.type === 'ACHIEVEMENT_UNLOCKED') {
            toast.success(`Достижение: ${reward.title}!\n+${reward.reward_points} баллов\n${reward.description}`, {
              icon: '🏆',
              duration: 5000,
              style: {
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 'bold'
              }
            });
          } else if (reward.type === 'TASK_COMPLETED') {
            toast.success(`${reward.title} (+${reward.reward_points}XP)`, { duration: 4000 });
          }

          if (reward.level_up) {
             toast.success("Поздравляем! Вы достигли НОВОГО УРОВНЯ! 🚀", { duration: 6000 });
          }
        });
      });
    }

    return response.data;
  },
  (error) => {
    // Автоматический редирект на логин при 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access - redirecting to login");
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Форматируем ошибку для UI
    const customError = new Error(error.response?.data?.message || error.message || "Произошла ошибка сервера");
    customError.status = error.response?.status;
    customError.details = error.response?.data;

    return Promise.reject(customError);
  }
);

export default api;

