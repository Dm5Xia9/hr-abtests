import React from 'react';

function FAQ() {
  const faqItems = [
    {
      question: "Сколько времени нужно на внедрение?",
      answer: "Базовую настройку можно сделать за 1-2 дня. Полное внедрение с учетом специфики компании занимает 1-2 недели."
    },
    {
      question: "Можно ли интегрировать с нашими HR-системами?",
      answer: "Да, TrackOn интегрируется с популярными HR-системами через API."
    },
    {
      question: "Есть ли бесплатный период?",
      answer: "Да, мы предоставляем 14 дней бесплатного использования для оценки продукта."
    }
  ];

  return (
    <section className="faq">
      <div className="container">
        <h2>Часто задаваемые вопросы</h2>
        {faqItems.map((item, index) => (
          <div className="faq-item" key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ; 