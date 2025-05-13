import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      quote: "TrackOn помог нам сократить время адаптации на 40% и повысить удовлетворенность новичков",
      author: "Анна Петрова",
      position: "HR Director, TechCorp",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop"
    },
    {
      quote: "Теперь мы точно знаем, на каком этапе адаптации находится каждый сотрудник",
      author: "Михаил Иванов",
      position: "Head of HR, FinTech",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="testimonials">
      <div className="container">
        <h2>Отзывы</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-content">
                <p>"{testimonial.quote}"</p>
              </div>
              <div className="testimonial-author">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.position}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 