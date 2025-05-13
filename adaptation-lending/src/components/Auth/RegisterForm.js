import React, { useState } from 'react';

function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    deploymentType: 'cloud', // 'cloud' or 'selfhosted'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setRegisterData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Здесь будет реальный запрос к API для регистрации
      await new Promise(resolve => setTimeout(resolve, 1000)); // имитация запроса
      console.log('Registration data:', registerData);
      
      // Если успешно зарегистрировались
      onSuccess();
    } catch (err) {
      setError('Ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>Регистрация в TrackOn</h3>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input
            type="text"
            id="name"
            value={registerData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={registerData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={registerData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="company">Компания</label>
          <input
            type="text"
            id="company"
            value={registerData.company}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Тип развертывания</label>
          <div className="deployment-options">
            <label className="deployment-option">
              <input
                type="radio"
                name="deploymentType"
                id="deploymentType"
                value="cloud"
                checked={registerData.deploymentType === 'cloud'}
                onChange={handleChange}
              />
              <div className="deployment-content">
                <h4>Cloud</h4>
                <p>Моментальный доступ, обновления и поддержка в облаке</p>
              </div>
            </label>
            
            <label className="deployment-option">
              <input
                type="radio"
                name="deploymentType"
                id="deploymentType"
                value="selfhosted"
                checked={registerData.deploymentType === 'selfhosted'}
                onChange={handleChange}
              />
              <div className="deployment-content">
                <h4>Self-Hosted</h4>
                <p>Установка на собственных серверах с полным контролем</p>
              </div>
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="cta-button full-width"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Уже есть аккаунт? <button className="text-button" onClick={onSwitchToLogin}>Войти</button></p>
      </div>
    </div>
  );
}

export default RegisterForm; 