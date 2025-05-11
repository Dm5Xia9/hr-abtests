// Smooth scrolling for anchor links
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

// Form handling
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            teamSize: document.getElementById('team-size').value,
            problems: document.getElementById('problems').value
        };

        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        
        // Show success message
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
        form.reset();
    });
} 