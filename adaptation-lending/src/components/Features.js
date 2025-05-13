import React from 'react';

function Features() {
  const features = [
    {
      title: 'Гибкая настройка',
      description: 'Создавайте уникальные треки адаптации под вашу компанию и должности'
    },
    {
      title: '3 типа шагов',
      description: 'Задачи, обучающие материалы и проверки знаний для комплексной адаптации'
    },
    {
      title: 'Прозрачность',
      description: 'Отслеживайте прогресс каждого сотрудника и помогайте при необходимости'
    }
  ];
  
  return (
    <section className="features">
      <div className="container">
        <h2>Как это работает</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features; 