import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await register({
          full_name: form.get('full_name'),
          business_name: form.get('business_name'),
          email: form.get('email'),
          password: form.get('password'),
        });
      } else {
        await login(form.get('email'), form.get('password'));
      }
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {isRegistering && (
        <>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Ваше имя</label>
            <input id="full_name" name="full_name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">Название бизнеса</label>
            <input id="business_name" name="business_name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </>
      )}
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
            placeholder="you@example.com"
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
            minLength="6"
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <Button type="submit" className="w-full">
          {isSubmitting ? 'Подождите...' : isRegistering ? 'Создать аккаунт' : 'Войти'}
        </Button>
      </div>
      <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(''); }} className="w-full text-sm text-[var(--color-brand-blue)] hover:underline">
        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </form>
  );
};

export default Login;
