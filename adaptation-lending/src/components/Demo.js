import React from 'react';

function Demo() {
  const demoFeatures = [
    {
      title: 'Треки адаптации',
      description: 'Создавайте и настраивайте треки под разные должности и роли'
    },
    {
      title: 'Прогресс',
      description: 'Отслеживайте выполнение задач и прохождение обучения'
    },
    {
      title: 'Отчеты',
      description: 'Получайте аналитику по эффективности адаптации'
    }
  ];

  return (
    <section className="demo">
      <div className="container">
        <h2>Как это выглядит</h2>
        <div className="demo-container">
          <div className="demo-frame">
            <iframe 
              src="http://127.0.0.1:5173/" 
              title="TrackOn Demo" 
              frameBorder="0"
              scrolling="no"
              style={{ overflow: 'hidden' }}
            ></iframe>
          </div>
        </div>
        <div className="demo-features">
          {demoFeatures.map((feature, index) => (
            <div className="demo-feature" key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Demo; 