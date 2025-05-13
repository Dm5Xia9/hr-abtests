import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="animated-title">Адаптация без хаоса</h1>
        <p>Создавайте структурированные треки адаптации, отслеживайте прогресс и помогайте новым сотрудникам быстрее влиться в команду.</p>
        <a 
          href="#deployment" 
          className="cta-button"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('deployment');
          }}
        >
          Начать бесплатно
        </a>
      </div>
    </section>
  );
}

export default Hero; 