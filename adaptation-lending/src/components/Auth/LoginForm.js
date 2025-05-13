import React, { useState } from 'react';

function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLoginData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Здесь будет реальный запрос к API для авторизации
      await new Promise(resolve => setTimeout(resolve, 1000)); // имитация запроса
      console.log('Login attempt:', loginData);
      
      // Если успешно авторизовались
      onSuccess();
    } catch (err) {
      setError('Ошибка при входе. Проверьте введенные данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>Вход в TrackOn</h3>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="cta-button full-width"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Еще не зарегистрированы? <button className="text-button" onClick={onSwitchToRegister}>Создать аккаунт</button></p>
      </div>
    </div>
  );
}

export default LoginForm; 