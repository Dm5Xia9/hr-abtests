import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';

function Header({ onOpenAuthModal }) {
  return (
    <header>
      <div className="container header-content">
        <a href="#" className="logo">TrackOn</a>
        
        <div className="header-buttons">
          <button 
            className="login-button"
            onClick={() => onOpenAuthModal('login')}
          >
            Войти
          </button>
          
          <a 
            href="#deployment" 
            className="cta-button"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('deployment');
            }}
          >
            Попробовать
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header; 