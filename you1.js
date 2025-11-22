/* ============================================
   NICUE VN - PROFESSIONAL APPLICATION CORE
   Version: 1.0.1 - YouTube Integration
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION & CONSTANTS
   ============================================ */

const CONFIG = {
  version: '1.0.1',
  app_name: 'NiCue VN',
  debug: false,
  api_timeout: 5000,
  cache_duration: 3600000,
  toast_duration: 3500,
  animation_duration: 300,
  debounce_delay: 300,
  throttle_delay: 100,
  // YouTube Links
  youtube_channel: 'https://www.youtube.com/@NiCueeVN?sub_confirmation=1',
  youtube_video: 'https://youtu.be/VoExC_1GX-E?si=UdDQ54JgLmtH-Lq3',
};

const SELECTORS = {
  navbar: '#navbar',
  navToggle: '#navToggle',
  navMenu: '#navMenu',
  navLink: '.nav-link',
  backToTop: '#backToTop',
  toast: '#toast',
  heroStats: '.hero-stats',
  downloadFlow: '.download-flow',
  downloadStep: '.download-step',
  subscribeBtn: '#subscribeBtn',
  likeBtn: '#likeBtn',
  commentBtn: '#commentBtn',
  likeProgress: '#likeProgress',
  commentProgress: '#commentProgress',
  progressFill: '#progressFill',
};

const EVENTS = {
  SUBSCRIBE: 'download:subscribe',
  LIKE: 'download:like',
  COMMENT: 'download:comment',
  VERIFY: 'download:verify',
  COMPLETE: 'download:complete',
};

/* ============================================
   LOGGER - LOGGING SYSTEM
   ============================================ */

const Logger = (() => {
  const log = (message, data = null, level = 'info') => {
    if (!CONFIG.debug) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch(level) {
      case 'error':
        console.error(`${prefix}`, message, data);
        break;
      case 'warn':
        console.warn(`${prefix}`, message, data);
        break;
      case 'success':
        console.log(`%c${prefix}`, 'color: green;', message, data);
        break;
      default:
        console.log(`%c${prefix}`, 'color: blue;', message, data);
    }
  };

  return {
    info: (msg, data) => log(msg, data, 'info'),
    error: (msg, data) => log(msg, data, 'error'),
    warn: (msg, data) => log(msg, data, 'warn'),
    success: (msg, data) => log(msg, data, 'success'),
  };
})();

/* ============================================
   EVENT EMITTER - PUBLISH/SUBSCRIBE PATTERN
   ============================================ */

const EventEmitter = (() => {
  const events = {};

  const on = (eventName, callback) => {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(callback);
    Logger.info(`Event listener registered: ${eventName}`);
  };

  const off = (eventName, callback) => {
    if (events[eventName]) {
      events[eventName] = events[eventName].filter(cb => cb !== callback);
    }
  };

  const emit = (eventName, data) => {
    Logger.info(`Event emitted: ${eventName}`, data);
    if (events[eventName]) {
      events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          Logger.error(`Error in event listener for ${eventName}`, error);
        }
      });
    }
  };

  const once = (eventName, callback) => {
    const wrapper = (data) => {
      callback(data);
      off(eventName, wrapper);
    };
    on(eventName, wrapper);
  };

  return { on, off, emit, once };
})();

/* ============================================
   STORAGE MANAGER - LOCAL STORAGE WITH EXPIRY
   ============================================ */

const StorageManager = (() => {
  const set = (key, value, duration = CONFIG.cache_duration) => {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        duration,
      };
      localStorage.setItem(key, JSON.stringify(data));
      Logger.success(`Storage set: ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Storage set error: ${key}`, error);
      return false;
    }
  };

  const get = (key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      
      if (!data) return null;

      if (Date.now() - data.timestamp > data.duration) {
        remove(key);
        Logger.warn(`Storage key expired: ${key}`);
        return null;
      }

      Logger.info(`Storage retrieved: ${key}`);
      return data.value;
    } catch (error) {
      Logger.error(`Storage get error: ${key}`, error);
      return null;
    }
  };

  const remove = (key) => {
    try {
      localStorage.removeItem(key);
      Logger.success(`Storage removed: ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Storage remove error: ${key}`, error);
      return false;
    }
  };

  const clear = () => {
    try {
      localStorage.clear();
      Logger.success('Storage cleared');
      return true;
    } catch (error) {
      Logger.error('Storage clear error', error);
      return false;
    }
  };

  return { set, get, remove, clear };
})();

/* ============================================
   DOM MANAGER - SAFE DOM MANIPULATION
   ============================================ */

const DOMManager = (() => {
  const query = (selector) => {
    try {
      return document.querySelector(selector);
    } catch (error) {
      Logger.error(`Query selector error: ${selector}`, error);
      return null;
    }
  };

  const queryAll = (selector) => {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      Logger.error(`QueryAll selector error: ${selector}`, error);
      return [];
    }
  };

  const addClass = (element, className) => {
    if (element && typeof element.classList !== 'undefined') {
      element.classList.add(className);
    }
  };

  const removeClass = (element, className) => {
    if (element && typeof element.classList !== 'undefined') {
      element.classList.remove(className);
    }
  };

  const toggleClass = (element, className) => {
    if (element && typeof element.classList !== 'undefined') {
      element.classList.toggle(className);
    }
  };

  const hasClass = (element, className) => {
    if (element && typeof element.classList !== 'undefined') {
      return element.classList.contains(className);
    }
    return false;
  };

  const setText = (element, text) => {
    if (element) {
      element.textContent = text;
    }
  };

  const setHTML = (element, html) => {
    if (element) {
      element.innerHTML = html;
    }
  };

  const setAttribute = (element, attr, value) => {
    if (element) {
      element.setAttribute(attr, value);
    }
  };

  const removeAttribute = (element, attr) => {
    if (element) {
      element.removeAttribute(attr);
    }
  };

  const on = (element, event, callback, options = {}) => {
    if (element) {
      element.addEventListener(event, callback, options);
    }
  };

  const off = (element, event, callback) => {
    if (element) {
      element.removeEventListener(event, callback);
    }
  };

  return {
    query,
    queryAll,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    setText,
    setHTML,
    setAttribute,
    removeAttribute,
    on,
    off,
  };
})();

/* ============================================
   UTILITY FUNCTIONS - HELPER METHODS
   ============================================ */

const Utils = (() => {
  const debounce = (func, wait = CONFIG.debounce_delay) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const throttle = (func, limit = CONFIG.throttle_delay) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getUrlParam = (name) => {
    const url = new URL(window.location);
    return url.searchParams.get(name);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Logger.success('Copied to clipboard');
      return true;
    } catch (error) {
      Logger.error('Copy to clipboard failed', error);
      return false;
    }
  };

  const formatCurrency = (value, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatDate = (date, format = 'DD/MM/YYYY') => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  };

  const isEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isPhone = (phone) => {
    const regex = /^[0-9]{10,}$/;
    return regex.test(phone.replace(/\D/g, ''));
  };

  const isEmpty = (value) => {
    return value === null || value === undefined || value === '';
  };

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const openInNewTab = (url) => {
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    } else {
      Logger.warn('Popup blocked, attempting redirect');
      window.location.href = url;
    }
  };

  return {
    debounce,
    throttle,
    delay,
    getUrlParam,
    copyToClipboard,
    formatCurrency,
    formatDate,
    isEmail,
    isPhone,
    isEmpty,
    random,
    openInNewTab,
  };
})();

/* ============================================
   NOTIFICATION MANAGER - TOAST SYSTEM
   ============================================ */

const NotificationManager = (() => {
  let toastQueue = [];
  let isShowing = false;

  const show = async (message, type = 'info') => {
    return new Promise((resolve) => {
      toastQueue.push({ message, type, resolve });
      processQueue();
    });
  };

  const processQueue = async () => {
    if (isShowing || toastQueue.length === 0) return;

    isShowing = true;
    const { message, type, resolve } = toastQueue.shift();

    const toast = DOMManager.query(SELECTORS.toast);
    if (!toast) {
      isShowing = false;
      resolve();
      return;
    }

    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    DOMManager.setText(toastMessage, message);

    let iconHTML = '';
    switch(type) {
      case 'success':
        iconHTML = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        iconHTML = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        iconHTML = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      default:
        iconHTML = '<i class="fas fa-info-circle"></i>';
    }
    DOMManager.setHTML(toastIcon, iconHTML);

    DOMManager.removeClass(toast, 'success');
    DOMManager.removeClass(toast, 'error');
    DOMManager.removeClass(toast, 'warning');
    DOMManager.removeClass(toast, 'info');

    DOMManager.addClass(toast, type);

    await Utils.delay(50);
    DOMManager.addClass(toast, 'show');

    await Utils.delay(CONFIG.toast_duration);
    DOMManager.removeClass(toast, 'show');

    await Utils.delay(CONFIG.animation_duration);
    isShowing = false;
    processQueue();
    resolve();
  };

  return {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
    info: (msg) => show(msg, 'info'),
  };
})();

/* ============================================
   DOWNLOAD FLOW - MAIN APPLICATION STATE
   ============================================ */

const DownloadFlow = (() => {
  let state = {
    currentStep: 1,
    completed: {
      subscribe: false,
      like: false,
      comment: false,
    },
    startTime: null,
    completedTime: null,
  };

  const getState = () => ({ ...state });

  const setState = (updates) => {
    state = { ...state, ...updates };
    Logger.info('State updated', state);
    EventEmitter.emit('state:changed', state);
  };

  const init = () => {
    Logger.info('DownloadFlow initialized');
    hideAllSteps();
    setupEventListeners();
    showStep(1);
    state.startTime = Date.now();
  };

  const hideAllSteps = () => {
    const steps = DOMManager.queryAll(SELECTORS.downloadStep);
    steps.forEach(step => {
      DOMManager.removeClass(step, 'active');
    });
  };

  const setupEventListeners = () => {
    const subscribeBtn = DOMManager.query(SELECTORS.subscribeBtn);
    const likeBtn = DOMManager.query(SELECTORS.likeBtn);
    const commentBtn = DOMManager.query(SELECTORS.commentBtn);

    if (subscribeBtn) {
      DOMManager.on(subscribeBtn, 'click', (e) => {
        e.preventDefault();
        handleSubscribe();
      });
    }

    if (likeBtn) {
      DOMManager.on(likeBtn, 'click', (e) => {
        e.preventDefault();
        handleLike();
      });
    }

    if (commentBtn) {
      DOMManager.on(commentBtn, 'click', (e) => {
        e.preventDefault();
        handleComment();
      });
    }
  };

  const handleSubscribe = async () => {
    Logger.info('Subscribe clicked - Opening YouTube channel');
    
    // Mở kênh YouTube trong tab mới
    Utils.openInNewTab(CONFIG.youtube_channel);

    // Đợi một chút để người dùng chuyển qua tab mới
    await Utils.delay(500);

    setState({
      completed: {
        ...state.completed,
        subscribe: true,
      },
    });

    const subscribeBtn = DOMManager.query(SELECTORS.subscribeBtn);
    if (subscribeBtn) {
      DOMManager.setAttribute(subscribeBtn, 'disabled', 'true');
      DOMManager.addClass(subscribeBtn, 'completed');
      DOMManager.setHTML(subscribeBtn, '<i class="fas fa-check"></i> Đã Đăng Ký');
    }

    await NotificationManager.success('🎉 Cảm ơn bạn đã đăng ký kênh!');
    EventEmitter.emit(EVENTS.SUBSCRIBE, { timestamp: Date.now() });

    await Utils.delay(1000);
    showStep(2);
  };

  const handleLike = async () => {
    if (state.completed.like) return;

    Logger.info('Like clicked - Opening YouTube video');

    // Mở video YouTube trong tab mới
    Utils.openInNewTab(CONFIG.youtube_video);

    // Đợi một chút
    await Utils.delay(500);

    setState({
      completed: {
        ...state.completed,
        like: true,
      },
    });

    const likeBtn = DOMManager.query(SELECTORS.likeBtn);
    if (likeBtn) {
      DOMManager.setAttribute(likeBtn, 'disabled', 'true');
      DOMManager.addClass(likeBtn, 'completed');
      DOMManager.setHTML(likeBtn, '<i class="fas fa-check"></i> Đã Like');
    }

    const likeProgress = DOMManager.query(SELECTORS.likeProgress);
    if (likeProgress) {
      DOMManager.addClass(likeProgress, 'completed');
      const statusEl = likeProgress.querySelector('.status');
      if (statusEl) {
        DOMManager.setText(statusEl, '✓ Đã Hoàn Thành');
      }
    }

    await NotificationManager.success('👍 Cảm ơn bạn đã like video!');
    EventEmitter.emit(EVENTS.LIKE, { timestamp: Date.now() });

    checkStep2Completed();
  };

  const handleComment = async () => {
    if (state.completed.comment) return;

    Logger.info('Comment clicked - Opening YouTube video');

    // Mở video YouTube trong tab mới
    Utils.openInNewTab(CONFIG.youtube_video);

    // Đợi một chút
    await Utils.delay(500);

    setState({
      completed: {
        ...state.completed,
        comment: true,
      },
    });

    const commentBtn = DOMManager.query(SELECTORS.commentBtn);
    if (commentBtn) {
      DOMManager.setAttribute(commentBtn, 'disabled', 'true');
      DOMManager.addClass(commentBtn, 'completed');
      DOMManager.setHTML(commentBtn, '<i class="fas fa-check"></i> Đã Comment');
    }

    const commentProgress = DOMManager.query(SELECTORS.commentProgress);
    if (commentProgress) {
      DOMManager.addClass(commentProgress, 'completed');
      const statusEl = commentProgress.querySelector('.status');
      if (statusEl) {
        DOMManager.setText(statusEl, '✓ Đã Hoàn Thành');
      }
    }

    await NotificationManager.success('💬 Cảm ơn bạn đã comment!');
    EventEmitter.emit(EVENTS.COMMENT, { timestamp: Date.now() });

    checkStep2Completed();
  };

  const checkStep2Completed = async () => {
    const { like, comment } = state.completed;
    if (like && comment) {
      await Utils.delay(800);
      await NotificationManager.info('🚀 Đang xác minh...');
      showStep(3);
    }
  };

  const showStep = (stepNumber) => {
    Logger.info(`Showing step: ${stepNumber}`);
    setState({ currentStep: stepNumber });

    const steps = DOMManager.queryAll(SELECTORS.downloadStep);
    steps.forEach(step => {
      DOMManager.removeClass(step, 'active');
    });

    const currentStep = DOMManager.query(`#step${stepNumber}`);
    if (currentStep) {
      currentStep.offsetHeight;
      DOMManager.addClass(currentStep, 'active');

      if (stepNumber === 3) {
        handleVerificationStep();
      } else if (stepNumber === 4) {
        handleDownloadStep();
      }
    }
  };

  const handleVerificationStep = async () => {
    Logger.info('Verification step started');
    
    const progressFill = DOMManager.query(SELECTORS.progressFill);
    if (!progressFill) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Utils.random(15, 35);
      if (progress > 100) progress = 100;
      
      progressFill.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        Logger.info('Verification completed');
        finishVerification();
      }
    }, 500);
  };

  const finishVerification = async () => {
    await Utils.delay(800);
    await NotificationManager.success('✓ Xác minh thành công!');
    EventEmitter.emit(EVENTS.VERIFY, { timestamp: Date.now() });

    setState({ completedTime: Date.now() });
    showStep(4);
    EventEmitter.emit(EVENTS.COMPLETE, { state });
  };

  const handleDownloadStep = () => {
    Logger.info('Download step displayed');
  };

  const reset = async () => {
    Logger.warn('Resetting download flow');

    const subscribeBtn = DOMManager.query(SELECTORS.subscribeBtn);
    if (subscribeBtn) {
      DOMManager.removeAttribute(subscribeBtn, 'disabled');
      DOMManager.removeClass(subscribeBtn, 'completed');
      DOMManager.setHTML(subscribeBtn, '<i class="fab fa-youtube"></i> Đăng Ký Ngay');
    }

    const likeBtn = DOMManager.query(SELECTORS.likeBtn);
    if (likeBtn) {
      DOMManager.removeAttribute(likeBtn, 'disabled');
      DOMManager.removeClass(likeBtn, 'completed');
      DOMManager.setHTML(likeBtn, '<i class="fas fa-thumbs-up"></i> <span>Like Video</span>');
    }

    const commentBtn = DOMManager.query(SELECTORS.commentBtn);
    if (commentBtn) {
      DOMManager.removeAttribute(commentBtn, 'disabled');
      DOMManager.removeClass(commentBtn, 'completed');
      DOMManager.setHTML(commentBtn, '<i class="fas fa-comment"></i> <span>Comment Video</span>');
    }

    const progressItems = DOMManager.queryAll('.progress-item');
    progressItems.forEach(item => {
      DOMManager.removeClass(item, 'completed');
      const statusEl = item.querySelector('.status');
      if (statusEl) {
        DOMManager.setText(statusEl, 'Chưa hoàn thành');
      }
    });

    setState({
      currentStep: 1,
      completed: { subscribe: false, like: false, comment: false },
      startTime: Date.now(),
      completedTime: null,
    });

    showStep(1);
    await NotificationManager.info('Đã reset flow');
  };

  return {
    init,
    showStep,
    handleSubscribe,
    handleLike,
    handleComment,
    reset,
    getState,
  };
})();

/* ============================================
   NAVIGATION MANAGER - NAVBAR INTERACTIONS
   ============================================ */

const NavigationManager = (() => {
  const init = () => {
    setupMobileMenu();
    setupSmoothScroll();
    setupScrollEffect();
  };

  const setupMobileMenu = () => {
    const navToggle = DOMManager.query(SELECTORS.navToggle);
    const navMenu = DOMManager.query(SELECTORS.navMenu);

    if (navToggle && navMenu) {
      DOMManager.on(navToggle, 'click', () => {
        DOMManager.toggleClass(navMenu, 'active');
      });

      const navLinks = DOMManager.queryAll(SELECTORS.navLink);
      navLinks.forEach(link => {
        DOMManager.on(link, 'click', () => {
          DOMManager.removeClass(navMenu, 'active');
        });
      });
    }
  };

  const setupSmoothScroll = () => {
    const links = DOMManager.queryAll('a[href^="#"]');
    links.forEach(link => {
      DOMManager.on(link, 'click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = DOMManager.query(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  const setupScrollEffect = () => {
    const navbar = DOMManager.query(SELECTORS.navbar);
    if (!navbar) return;

    const handleScroll = Utils.throttle(() => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
      } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }
    });

    window.addEventListener('scroll', handleScroll);
  };

  return { init };
})();

/* ============================================
   STATS COUNTER - ANIMATED NUMBERS
   ============================================ */

const StatsCounter = (() => {
  const init = () => {
    const heroStats = DOMManager.query(SELECTORS.heroStats);
    if (!heroStats) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(heroStats);
  };

  const animateCounters = () => {
    const counters = DOMManager.queryAll('[data-target]');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      animateCounter(counter, target);
    });
  };

  const animateCounter = (element, target) => {
    let current = 0;
    const increment = Math.ceil(target / 50);
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      DOMManager.setText(element, current);
    }, 20);
  };

  return { init };
})();

/* ============================================
   SCROLL TO TOP BUTTON
   ============================================ */

const ScrollToTop = (() => {
  const init = () => {
    const btn = DOMManager.query(SELECTORS.backToTop);
    if (!btn) return;

    const handleScroll = Utils.throttle(() => {
      if (window.scrollY > 300) {
        DOMManager.addClass(btn, 'show');
      } else {
        DOMManager.removeClass(btn, 'show');
      }
    });

    window.addEventListener('scroll', handleScroll);

    DOMManager.on(btn, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return { init };
})();

/* ============================================
   APP INITIALIZATION
   ============================================ */

const App = (() => {
  const init = () => {
    Logger.info('Application starting', { version: CONFIG.version });

    DownloadFlow.init();
    NavigationManager.init();
    StatsCounter.init();
    ScrollToTop.init();

    setupGlobalErrorHandling();
    setupPerformanceMonitoring();

    Logger.success('Application initialized successfully');
    EventEmitter.emit('app:ready');
  };

  const setupGlobalErrorHandling = () => {
    window.addEventListener('error', (event) => {
      Logger.error('Global error caught', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      Logger.error('Unhandled promise rejection', event.reason);
    });
  };

  const setupPerformanceMonitoring = () => {
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        Logger.info(`Page load time: ${pageLoadTime}ms`);
      });
    }
  };

  return { init };
})();

/* ============================================
   DOM READY & INITIALIZATION
   ============================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}

/* ============================================
   GLOBAL EXPORTS - PUBLIC API
   ============================================ */

window.NiCueApp = {
  version: CONFIG.version,
  DownloadFlow,
  Utils,
  StorageManager,
  DOMManager,
  NotificationManager,
  Logger,
  EventEmitter,
  reset: () => DownloadFlow.reset(),
  getState: () => DownloadFlow.getState(),
  config: {
    youtubeChannel: CONFIG.youtube_channel,
    youtubeVideo: CONFIG.youtube_video,
  }
};

window.downloadFlow = DownloadFlow;
window.app = App;
