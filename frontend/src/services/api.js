import axios from 'axios';

// Настройка базового URL для API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
    // В нашем Flask API формат ответов: { success: true/false, ...data }
    // Можно сразу возвращать данные из ответа
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
