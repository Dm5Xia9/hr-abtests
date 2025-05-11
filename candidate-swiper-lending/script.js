document.addEventListener('DOMContentLoaded', function() {
    // Background animation
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let connections = [];
        const particleCount = 50;
        const connectionDistance = 150;
        const particleSpeed = 0.5;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * particleSpeed;
                this.vy = (Math.random() - 0.5) * particleSpeed;
                this.radius = Math.random() * 2 + 1;
                this.alpha = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(37, 99, 235, ${this.alpha})`;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const alpha = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(37, 99, 235, ${alpha * 0.2})`;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            drawConnections();
            requestAnimationFrame(animate);
        }

        // Initialize
        resizeCanvas();
        createParticles();
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
    }

    // Handle form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(registrationForm);
            const data = Object.fromEntries(formData.entries());
            
            // Here you would typically send the data to your backend
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Спасибо за регистрацию! Мы свяжемся с вами в ближайшее время.');
            registrationForm.reset();
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle registration button clicks
    document.querySelectorAll('.btn--primary').forEach(button => {
        button.addEventListener('click', function() {
            const ctaSection = document.querySelector('.cta');
            if (ctaSection) {
                ctaSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 