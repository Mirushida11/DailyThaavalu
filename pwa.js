// PWA-specific functionality for Schedule Planner
class PWAApp {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.detectStandaloneMode();
  }

  // Register Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service Worker update found!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed: ', error);
      }
    }
  }

  // Handle install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Show our custom install prompt after a delay
      setTimeout(() => this.showInstallPrompt(), 3000);
    });

    window.addEventListener('appinstalled', (e) => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showToast('Dark Schedule Planner installed successfully! 🎉', 'success');
    });
  }

  // Detect if app is running in standalone mode
  detectStandaloneMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('App is running in standalone mode');
    }
  }

  // Show custom install prompt
  showInstallPrompt() {
    // Only show if not already installed and not in standalone mode
    if (!this.isInstalled && !window.matchMedia('(display-mode: standalone)').matches
