// ===== TYPES =====
interface NavState {
  isScrolled: boolean;
  activeSection: string;
  menuOpen: boolean;
}

interface TypewriterConfig {
  words: string[];
  speed: number;
  deleteSpeed: number;
  pauseTime: number;
}

// ===== NAVBAR =====
class Navbar {
  private nav: HTMLElement;
  private links: NodeListOf<HTMLAnchorElement>;
  private hamburger: HTMLButtonElement;
  private navLinks: HTMLUListElement;
  private state: NavState = { isScrolled: false, activeSection: 'home', menuOpen: false };

  constructor() {
    this.nav = document.getElementById('navbar') as HTMLElement;
    this.links = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
    this.hamburger = document.getElementById('hamburger') as HTMLButtonElement;
    this.navLinks = document.getElementById('navLinks') as HTMLUListElement;
    this.init();
  }

  private init(): void {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.hamburger.addEventListener('click', () => this.toggleMenu());
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
        this.setActive(link);
      });
    });
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target as Node)) this.closeMenu();
    });
  }

  private onScroll(): void {
    const scrolled = window.scrollY > 50;
    if (scrolled !== this.state.isScrolled) {
      this.state.isScrolled = scrolled;
      this.nav.classList.toggle('scrolled', scrolled);
    }
    this.updateActiveLink();
  }

  private updateActiveLink(): void {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    if (current !== this.state.activeSection) {
      this.state.activeSection = current;
      this.links.forEach(link => {
        const href = link.getAttribute('href')?.slice(1);
        link.classList.toggle('active', href === current);
      });
    }
  }

  private toggleMenu(): void {
    this.state.menuOpen = !this.state.menuOpen;
    this.hamburger.classList.toggle('open', this.state.menuOpen);
    this.navLinks.classList.toggle('open', this.state.menuOpen);
  }

  private closeMenu(): void {
    this.state.menuOpen = false;
    this.hamburger.classList.remove('open');
    this.navLinks.classList.remove('open');
  }

  private setActive(link: HTMLAnchorElement): void {
    this.links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }
}

// ===== THEME TOGGLE =====
class ThemeManager {
  private btn: HTMLButtonElement;
  private icon: HTMLElement;
  private theme: 'dark' | 'light';

  constructor() {
    this.btn = document.getElementById('themeToggle') as HTMLButtonElement;
    this.icon = this.btn.querySelector('.theme-icon') as HTMLElement;
    this.theme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    this.apply();
    this.btn.addEventListener('click', () => this.toggle());
  }

  private toggle(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.apply();
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.icon.textContent = this.theme === 'dark' ? '🌙' : '☀️';
  }
}

// ===== TYPEWRITER =====
class Typewriter {
  private el: HTMLElement;
  private config: TypewriterConfig;
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  constructor(el: HTMLElement, config: TypewriterConfig) {
    this.el = el;
    this.config = config;
    this.type();
  }

  private type(): void {
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
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, i * 80);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    this.observe();
  }

  private observe(): void {
    document.querySelectorAll<HTMLElement>(
      '.skill-card, .project-card, .contact-card, .about-text, .info-item, .stat'
    ).forEach(el => {
      el.classList.add('reveal');
      this.observer.observe(el);
    });
  }
}

// ===== SKILL BARS =====
class SkillBars {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll<HTMLElement>('.skill-fill');
            fills.forEach(fill => fill.classList.add('animated'));
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll<HTMLElement>('.skill-category').forEach(cat => {
      this.observer.observe(cat);
    });
  }
}

// ===== PROJECT FILTER =====
class ProjectFilter {
  private buttons: NodeListOf<HTMLButtonElement>;
  private cards: NodeListOf<HTMLElement>;

  constructor() {
    this.buttons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
    this.cards = document.querySelectorAll<HTMLElement>('.project-card');
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => this.filter(btn));
    });
  }

  private filter(btn: HTMLButtonElement): void {
    this.buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter || 'all';
    this.cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (show) {
        card.classList.remove('hidden');
        card.style.opacity = '1';
        card.style.transform = '';
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
  private form: HTMLFormElement;
  private submitBtn: HTMLButtonElement;
  private successMsg: HTMLElement;

  constructor() {
    this.form = document.getElementById('contactForm') as HTMLFormElement;
    this.submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    this.successMsg = document.getElementById('formSuccess') as HTMLElement;
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.form-input').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  private validateField(field: HTMLInputElement | HTMLTextAreaElement): boolean {
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

  private clearError(field: HTMLInputElement | HTMLTextAreaElement): void {
    field.classList.remove('error');
    const errorEl = document.getElementById(`${field.id}Error`);
    if (errorEl) errorEl.textContent = '';
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    const fields = this.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.form-input');
    let valid = true;
    fields.forEach(field => { if (!this.validateField(field)) valid = false; });
    if (!valid) return;

    this.submitBtn.disabled = true;
    this.submitBtn.querySelector('.btn-text')!.textContent = 'Enviando...';

    // Simulate async send
    setTimeout(() => {
      this.form.reset();
      this.submitBtn.disabled = false;
      this.submitBtn.querySelector('.btn-text')!.textContent = 'Enviar mensaje';
      this.successMsg.classList.add('show');
      setTimeout(() => this.successMsg.classList.remove('show'), 5000);
    }, 1500);
  }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector<HTMLElement>(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        const top = target.offsetTop - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
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
