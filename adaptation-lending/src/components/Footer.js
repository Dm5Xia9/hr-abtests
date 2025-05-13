import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="container">
        <p>© {new Date().getFullYear()} TrackOn. Все права защищены.</p>
        <p>Контакты: hello@trackon.ru</p>
      </div>
    </footer>
  );
}

export default Footer; 