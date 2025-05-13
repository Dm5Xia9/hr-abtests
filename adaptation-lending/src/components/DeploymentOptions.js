import React from 'react';

function DeploymentOptions({ onOpenAuthModal }) {
  const deploymentOptions = [
    {
      title: "Cloud (OnCloud)",
      description: "Быстро начните работу с облачным решением без необходимости настройки серверов.",
      features: [
        "Мгновенный доступ после регистрации",
        "Автоматические обновления и поддержка",
        "Гарантированная работоспособность 24/7",
        "Шифрование данных и регулярные бэкапы",
        "Полная техническая поддержка"
      ],
      action: {
        text: "Начать бесплатно",
        onClick: () => onOpenAuthModal('register')
      }
    },
    {
      title: "Self-Hosted",
      description: "Разверните TrackOn на собственных серверах для полного контроля над данными.",
      features: [
        "Установка в вашей инфраструктуре",
        "Полный контроль над данными и безопасностью",
        "Интеграция с корпоративными системами",
        "Настройка под требования вашей компании",
        "Техническая поддержка при внедрении"
      ],
      action: {
        text: "Запросить демо",
        onClick: () => onOpenAuthModal('selfhosted')
      }
    }
  ];

  // Иконка для пунктов списка
  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 13.5L4 10L3 11L7.5 15.5L17.5 5.5L16.5 4.5L7.5 13.5Z" fill="currentColor" />
    </svg>
  );

  return (
    <section className="deployment-section" id="deployment">
      <div className="container">
        <h2>Варианты развертывания</h2>
        <p className="section-description">
          Выберите удобный способ работы с TrackOn в зависимости от потребностей вашей компании
        </p>
        
        <div className="deployment-cards">
          {deploymentOptions.map((option, index) => (
            <div className="deployment-card" key={index}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              
              <div className="deployment-card-features">
                {option.features.map((feature, featureIndex) => (
                  <div className="deployment-feature" key={featureIndex}>
                    <CheckIcon />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="cta-button"
                onClick={option.action.onClick}
              >
                {option.action.text}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DeploymentOptions; 