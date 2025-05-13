import React, { useState } from 'react';
import Modal from '../Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SelfHostedForm from './SelfHostedForm';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', or 'selfhosted'
  
  const handleAuthSuccess = () => {
    // Here we would typically store auth token in localStorage or context
    console.log('Authentication successful');
    onClose();
  };
  
  const handleSelfHostedSuccess = () => {
    console.log('Self-hosted request successful');
    onClose();
    // Можно показать сообщение об успешной отправке
    alert('Спасибо за запрос! Мы свяжемся с вами в ближайшее время.');
  };
  
  const handleSwitchToRegister = () => {
    setMode('register');
  };
  
  const handleSwitchToLogin = () => {
    setMode('login');
  };
  
  // Заголовок модального окна в зависимости от режима
  const getModalTitle = () => {
    switch (mode) {
      case 'login':
        return 'Вход';
      case 'register':
        return 'Регистрация';
      case 'selfhosted':
        return 'Запрос Self-Hosted решения';
      default:
        return 'TrackOn';
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
    >
      {mode === 'login' && (
        <LoginForm 
          onSuccess={handleAuthSuccess} 
          onSwitchToRegister={handleSwitchToRegister} 
        />
      )}
      
      {mode === 'register' && (
        <RegisterForm 
          onSuccess={handleAuthSuccess} 
          onSwitchToLogin={handleSwitchToLogin} 
        />
      )}
      
      {mode === 'selfhosted' && (
        <SelfHostedForm 
          onSuccess={handleSelfHostedSuccess} 
        />
      )}
    </Modal>
  );
}

export default AuthModal; 