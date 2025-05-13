import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    problems: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      teamSize: '',
      problems: ''
    });
  };

  return (
    <section className="form-section" id="form">
      <div className="container">
        <div className="form-container">
          <h2>Запросить Self-Hosted решение</h2>
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
            <button type="submit" className="cta-button">Отправить запрос</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactForm; 