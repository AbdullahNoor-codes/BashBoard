class NotificationService {
  static async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  static sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png', // Add your app icon path
        ...options
      });
    }
  }
}

export default NotificationService;
