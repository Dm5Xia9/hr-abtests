import React, { useState } from 'react';

function SelfHostedForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    problems: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Здесь будет реальный запрос к API для запроса self-hosted
      await new Promise(resolve => setTimeout(resolve, 1000)); // имитация запроса
      console.log('Self-hosted request submitted:', formData);
      
      // Если успешно отправили запрос
      onSuccess();
    } catch (err) {
      setError('Ошибка при отправке запроса. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h3>Запрос Self-Hosted решения</h3>
      
      {error && <div className="auth-error">{error}</div>}
      
      <p className="selfhosted-description">
        Заполните форму, чтобы получить информацию о развертывании TrackOn на вашей инфраструктуре и запросить демонстрацию.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input 
            type="text" 
            id="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="company">Компания</label>
          <input 
            type="text" 
            id="company" 
            value={formData.company}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="teamSize">Размер команды</label>
          <input 
            type="number" 
            id="teamSize" 
            value={formData.teamSize}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="problems">Какие проблемы в адаптации вы хотите решить?</label>
          <textarea 
            id="problems" 
            rows="4"
            value={formData.problems}
            onChange={handleChange}
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="cta-button full-width"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить запрос'}
        </button>
      </form>
    </div>
  );
}

export default SelfHostedForm;