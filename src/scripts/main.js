// ===== NAVBAR =====
class Navbar {
  constructor() {
    this.nav = document.getElementById('navbar');
    this.links = document.querySelectorAll('.nav-link');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks = document.getElementById('navLinks');
    this.state = { isScrolled: false, activeSection: 'home', menuOpen: false };
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.hamburger.addEventListener('click', () => this.toggleMenu());
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
        this.setActive(link);
      });
    });
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) this.closeMenu();
    });
  }

  onScroll() {
    const scrolled = window.scrollY > 50;
    if (scrolled !== this.state.isScrolled) {
      this.state.isScrolled = scrolled;
      this.nav.classList.toggle('scrolled', scrolled);
    }
    this.updateActiveLink();
  }

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 100) current = section.id;
    });
    if (current !== this.state.activeSection) {
      this.state.activeSection = current;
      this.links.forEach(link => {
        const href = link.getAttribute('href')?.slice(1);
        link.classList.toggle('active', href === current);
      });
    }
  }

  toggleMenu() {
    this.state.menuOpen = !this.state.menuOpen;
    this.hamburger.classList.toggle('open', this.state.menuOpen);
    this.navLinks.classList.toggle('open', this.state.menuOpen);
  }

  closeMenu() {
    this.state.menuOpen = false;
    this.hamburger.classList.remove('open');
    this.navLinks.classList.remove('open');
  }

  setActive(link) {
    this.links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }
}

// ===== THEME MANAGER =====
class ThemeManager {
  constructor() {
    this.btn = document.getElementById('themeToggle');
    this.icon = this.btn.querySelector('.theme-icon');
    this.theme = localStorage.getItem('theme') || 'dark';
    this.apply();
    this.btn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.apply();
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.icon.textContent = this.theme === 'dark' ? '🌙' : '☀️';
  }
}

// ===== TYPEWRITER =====
class Typewriter {
  constructor(el, config) {
    this.el = el;
    this.config = config;
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.type();
  }

  type() {
    const word = this.config.words[this.wordIndex];
    const current = this.isDeleting
      ? word.substring(0, this.charIndex - 1)
      : word.substring(0, this.charIndex + 1);

    this.el.textContent = current;
    this.charIndex = this.isDeleting ? this.charIndex - 1 : this.charIndex + 1;

    let delay = this.isDeleting ? this.config.deleteSpeed : this.config.speed;

    if (!this.isDeleting && this.charIndex === word.length + 1) {
      delay = this.config.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.config.words.length;
    }

    setTimeout(() => this.type(), delay);
  }
}

// ===== SCROLL REVEAL =====
class ScrollReveal {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    this.observe();
  }

  observe() {
    document.querySelectorAll(
      '.skill-card, .project-card, .contact-card, .about-text, .info-item, .stat'
    ).forEach(el => {
      el.classList.add('reveal');
      this.observer.observe(el);
    });
  }
}

// ===== SKILL BARS =====
class SkillBars {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(fill => fill.classList.add('animated'));
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll('.skill-category').forEach(cat => this.observer.observe(cat));
  }
}

// ===== PROJECT FILTER =====
class ProjectFilter {
  constructor() {
    this.buttons = document.querySelectorAll('.filter-btn');
    this.cards = document.querySelectorAll('.project-card');
    this.buttons.forEach(btn => btn.addEventListener('click', () => this.filter(btn)));
  }

  filter(btn) {
    this.buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter || 'all';
    this.cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (show) {
        card.classList.remove('hidden');
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = '';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.classList.add('hidden'), 300);
      }
    });
  }
}

// ===== CONTACT FORM =====
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.successMsg = document.getElementById('formSuccess');
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  validateField(field) {
    const errorEl = document.getElementById(`${field.id}Error`);
    let error = '';
    if (!field.value.trim()) {
      error = 'Este campo es requerido.';
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      error = 'Ingresa un email válido.';
    }
    field.classList.toggle('error', !!error);
    if (errorEl) errorEl.textContent = error;
    return !error;
  }

  clearError(field) {
    field.classList.remove('error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) errorEl.textContent = '';
  }

  handleSubmit(e) {
    e.preventDefault();
    let valid = true;
    this.form.querySelectorAll('.form-input').forEach(field => {
      if (!this.validateField(field)) valid = false;
    });
    if (!valid) return;

    this.submitBtn.disabled = true;
    this.submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

    setTimeout(() => {
      this.form.reset();
      this.submitBtn.disabled = false;
      this.submitBtn.querySelector('.btn-text').textContent = 'Enviar mensaje';
      this.successMsg.classList.add('show');
      setTimeout(() => this.successMsg.classList.remove('show'), 5000);
    }, 1500);
  }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = 70;
        window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
      }
    });
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.textContent);
        const suffix = el.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current) + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  new Navbar();
  new ThemeManager();
  new ScrollReveal();
  new SkillBars();
  new ProjectFilter();
  new ContactForm();
  initSmoothScroll();
  animateCounters();

  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    new Typewriter(typewriterEl, {
      words: ['Full Stack Developer', 'UI/UX Enthusiast', 'TypeScript Lover', 'Problem Solver'],
      speed: 80,
      deleteSpeed: 40,
      pauseTime: 2000,
    });
  }
});
