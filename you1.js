/* ============================================
   DOWNLOAD FLOW - STATE MANAGEMENT
   ============================================ */

const downloadFlow = {
  currentStep: 1,
  completed: {
    subscribe: false,
    like: false,
    comment: false
  },

  init() {
    this.setupEventListeners();
    this.showStep(1);
  },

  setupEventListeners() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubscribe();
      });
    }

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
      likeBtn.addEventListener('click', () => this.handleLike());
    }

    const commentBtn = document.getElementById('commentBtn');
    if (commentBtn) {
      commentBtn.addEventListener('click', () => this.handleComment());
    }
  },

  handleSubscribe() {
    this.completed.subscribe = true;
    this.showToast('🎉 Cảm ơn bạn đã đăng ký kênh!', 'success');
    
    const subscribeBtn = document.getElementById('subscribeBtn');
    subscribeBtn.disabled = true;
    subscribeBtn.classList.add('completed');
    subscribeBtn.innerHTML = '<i class="fas fa-check"></i> Đã Đăng Ký';

    setTimeout(() => this.showStep(2), 1200);
  },

  handleLike() {
    if (this.completed.like) return;
    
    this.completed.like = true;
    this.showToast('👍 Cảm ơn bạn đã like video!', 'success');
    
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.disabled = true;
    likeBtn.classList.add('completed');
    likeBtn.innerHTML = '<i class="fas fa-check"></i> Đã Like';

    const likeProgress = document.getElementById('likeProgress');
    likeProgress.classList.add('completed');
    likeProgress.querySelector('.status').textContent = '✓ Đã Hoàn Thành';

    this.checkStep2Completed();
  },

  handleComment() {
    if (this.completed.comment) return;

    this.completed.comment = true;
    this.showToast('💬 Cảm ơn bạn đã comment!', 'success');
    
    const commentBtn = document.getElementById('commentBtn');
    commentBtn.disabled = true;
    commentBtn.classList.add('completed');
    commentBtn.innerHTML = '<i class="fas fa-check"></i> Đã Comment';

    const commentProgress = document.getElementById('commentProgress');
    commentProgress.classList.add('completed');
    commentProgress.querySelector('.status').textContent = '✓ Đã Hoàn Thành';

    this.checkStep2Completed();
  },

  checkStep2Completed() {
    if (this.completed.like && this.completed.comment) {
      setTimeout(() => {
        this.showToast('🚀 Đang xác minh...', 'info');
        this.showStep(3);
      }, 800);
    }
  },

  showStep(stepNumber) {
    this.currentStep = stepNumber;
    
    document.querySelectorAll('.download-step').forEach(step => {
      step.classList.remove('active');
    });

    const currentStepEl = document.getElementById(`step${stepNumber}`);
    if (currentStepEl) {
      currentStepEl.offsetHeight;
      currentStepEl.classList.add('active');

      if (stepNumber === 3) {
        this.handleVerificationStep();
      } else if (stepNumber === 4) {
        this.handleDownloadStep();
      }
    }
  },

  handleVerificationStep() {
    const progressFill = document.getElementById('progressFill');
    if (!progressFill) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress > 100) progress = 100;
      
      progressFill.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showToast('✓ Xác minh thành công!', 'success');
          this.showStep(4);
        }, 800);
      }
    }, 500);
  },

  handleDownloadStep() {
    console.log('Download step completed');
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;
    
    toast.classList.remove('error', 'info', 'success', 'show');

    switch(type) {
      case 'success':
        toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        toast.classList.add('success');
        break;
      case 'error':
        toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        toast.classList.add('error');
        break;
      default:
        toastIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
        toast.classList.add('info');
    }

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => toast.classList.remove('show'), 3500);
  },

  reset() {
    this.currentStep = 1;
    this.completed = {
      subscribe: false,
      like: false,
      comment: false
    };

    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
      subscribeBtn.disabled = false;
      subscribeBtn.classList.remove('completed');
      subscribeBtn.innerHTML = '<i class="fab fa-youtube"></i> Đăng Ký Ngay';
    }

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
      likeBtn.disabled = false;
      likeBtn.classList.remove('completed');
      likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> <span>Like Video</span>';
    }

    const commentBtn = document.getElementById('commentBtn');
    if (commentBtn) {
      commentBtn.disabled = false;
      commentBtn.classList.remove('completed');
      commentBtn.innerHTML = '<i class="fas fa-comment"></i> <span>Comment Video</span>';
    }

    document.querySelectorAll('.progress-item').forEach(item => {
      item.classList.remove('completed');
      item.querySelector('.status').textContent = 'Chưa hoàn thành';
    });

    this.showStep(1);
    this.showToast('Đã reset flow', 'info');
  }
};

/* ============================================
   COUNTER ANIMATION
   ============================================ */

function animateCounter() {
  const counters = document.querySelectorAll('[data-target]');
  
  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const current = +counter.innerText;
      const increment = target / 100;

      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });
}

const observerOptions = {
  threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.classList.contains('hero-stats')) {
      animateCounter();
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

/* ============================================
   SMOOTH SCROLL NAVIGATION
   ============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      const navMenu = document.getElementById('navMenu');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    }
  });
});

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

/* ============================================
   BACK TO TOP BUTTON
   ============================================ */

const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ============================================
   INITIALIZE ON DOM READY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  downloadFlow.init();

  // Observe hero stats for animation
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    observer.observe(heroStats);
  }
});

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

function showComingSoon() {
  downloadFlow.showToast('🚀 Tính năng này sắp ra mắt!', 'info');
}

// Expose for console access
window.downloadFlow = downloadFlow;

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 10) {
    navbar.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
  } else {
    navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  }
});

/* ============================================
   BUTTON RIPPLE EFFECT (Optional Enhancement)
   ============================================ */

document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    if (!this.style.position || this.style.position === 'static') {
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
    }

    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* ============================================
   FORM VALIDATION (If needed in future)
   ============================================ */

function validateForm(formData) {
  if (!formData.name || formData.name.trim() === '') {
    return { valid: false, message: 'Vui lòng nhập tên' };
  }
  if (!formData.email || !formData.email.includes('@')) {
    return { valid: false, message: 'Vui lòng nhập email hợp lệ' };
  }
  return { valid: true, message: 'Thành công' };
}

/* ============================================
   LOCAL STORAGE HELPERS
   ============================================ */

const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
};

/* ============================================
   ANALYTICS TRACKING (Optional)
   ============================================ */

const Analytics = {
  trackEvent(eventName, eventData = {}) {
    console.log(`Event: ${eventName}`, eventData);
    // Add your analytics integration here
  },

  trackPageView(page) {
    console.log(`Page view: ${page}`);
    // Add your analytics integration here
  }
};

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
  });
}

/* ============================================
   ERROR HANDLING
   ============================================ */

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get URL parameters
  getUrlParam(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
  },

  // Copy to clipboard
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  },

  // Format currency
  formatCurrency(value, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  // Format date
  formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  }
};

// Add ripple animation keyframe if not exists
if (!document.getElementById('ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
