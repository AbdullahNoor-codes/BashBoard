self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo.png', // Add your app logo path
    badge: '/badge.png', // Add your badge icon path
    vibrate: [200, 100, 200],
    tag: 'session-lock',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification('Session Lock Warning', options)
  );
});
