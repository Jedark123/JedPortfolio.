// ===== DOM ELEMENTS =====
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
const backToTop = document.querySelector('.back-to-top');
const skillCards = document.querySelectorAll('.skill-card');
const projectCards = document.querySelectorAll('.project-card');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ===== MOBILE MENU =====
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
});

overlay.addEventListener('click', () => {
  menuToggle.classList.remove('active');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
});

// Close sidebar on link click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.pageYOffset;
  
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ===== BACK TO TOP =====
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SCROLL REVEAL =====
function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  
  // Skill cards
  skillCards.forEach((card, index) => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < triggerBottom) {
      setTimeout(() => {
        card.classList.add('visible');
        // Animate progress bar
        const progressBar = card.querySelector('.skill-progress-bar');
        if (progressBar) {
          progressBar.style.width = progressBar.dataset.progress;
        }
      }, index * 100);
    }
  });
  
  // Project cards
  projectCards.forEach((card, index) => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < triggerBottom) {
      setTimeout(() => {
        card.classList.add('visible');
      }, index * 150);
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== PARTICLE SYSTEM =====
let particles = [];
let mouse = { x: null, y: null, radius: 150 };

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(43, 74%, 49%, ${this.opacity})`;
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'hsla(43, 74%, 49%, 0.5)';
  }
  
  update() {
    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;
        
        this.x -= directionX;
        this.y -= directionY;
      } else {
        // Return to base with smooth motion
        if (this.x !== this.baseX) {
          const dx = this.x - this.baseX;
          this.x -= dx / 20;
        }
        if (this.y !== this.baseY) {
          const dy = this.y - this.baseY;
          this.y -= dy / 20;
        }
      }
    }
    
    // Floating motion
    this.baseX += this.speedX;
    this.baseY += this.speedY;
    
    // Boundary check
    if (this.baseX < 0 || this.baseX > canvas.width) this.speedX *= -1;
    if (this.baseY < 0 || this.baseY > canvas.height) this.speedY *= -1;
    
    this.draw();
  }
}

function initParticles() {
  particles = [];
  const particleCount = Math.min(80, (canvas.width * canvas.height) / 15000);
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        ctx.strokeStyle = `hsla(43, 74%, 49%, ${0.15 * (1 - distance / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => particle.update());
  connectParticles();
  
  requestAnimationFrame(animateParticles);
}

// Mouse events for particles
const heroSection = document.querySelector('.hero');
heroSection.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

heroSection.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// Initialize particles
window.addEventListener('resize', () => {
  initCanvas();
  initParticles();
});

initCanvas();
initParticles();
animateParticles();

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
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

// ===== FORM HANDLING =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.message) {
      alert('Please fill in all fields');
      return;
    }
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      alert('Message sent successfully!');
      contactForm.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

// ===== TYPING EFFECT FOR HERO =====
// The typing effect is handled by CSS animation, but we can add extra effects here

// ===== INTERSECTION OBSERVER FOR FADE IN =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe section headers
document.querySelectorAll('.section-header').forEach(header => {
  header.style.opacity = '0';
  header.style.transform = 'translateY(30px)';
  header.style.transition = 'all 0.6s ease';
  observer.observe(header);
});

// ===== HIGHLIGHT CARDS ANIMATION =====
document.querySelectorAll('.highlight-card').forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = `all 0.5s ease ${index * 0.1}s`;
  
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  cardObserver.observe(card);
});

// ===== CONTACT METHODS ANIMATION =====
document.querySelectorAll('.contact-method').forEach((method, index) => {
  method.style.opacity = '0';
  method.style.transform = 'translateX(-20px)';
  method.style.transition = `all 0.5s ease ${index * 0.1}s`;
  
  const methodObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.1 });
  
  methodObserver.observe(method);
});

console.log('Portfolio loaded successfully! 🚀');
