import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login('admin@zerna-turki.kz', 'password');
    navigate('/dashboard');
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email адрес
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue="admin@zerna-turki.kz"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-brand-blue)] focus:border-[var(--color-brand-blue)] sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Пароль
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue="password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-brand-blue)] focus:border-[var(--color-brand-blue)] sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)] border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Запомнить меня
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-hover)]">
            Забыли пароль?
          </a>
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full">
          Войти
        </Button>
      </div>
    </form>
  );
};

export default Login;
