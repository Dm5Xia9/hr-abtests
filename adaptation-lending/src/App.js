import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import DeploymentOptions from './components/DeploymentOptions';
import Demo from './components/Demo';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AuthModal from './components/Auth/AuthModal';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login', 'register', or 'selfhosted'

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="App">
      <Header onOpenAuthModal={handleOpenAuthModal} />
      <Hero />
      <Features />
      <DeploymentOptions onOpenAuthModal={handleOpenAuthModal} />
      <Demo />
      <Testimonials />
      <FAQ />
      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App; 