// Service Worker for SkillLink
const CACHE_NAME = 'skilllink-v1';
const STATIC_CACHE = 'skilllink-static-v1';
const DYNAMIC_CACHE = 'skilllink-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/courses',
  '/login',
  '/register',
  '/manifest.json',
  '/offline.html'
];

// API routes to cache
const API_ROUTES = [
  '/api/courses',
  '/api/s3-presign-download',
  '/api/s3-diagnostics'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first for static files
    if (isStaticFile(url.pathname)) {
      const cachedResponse = await getFromCache(request, STATIC_CACHE);
      if (cachedResponse) {
        console.log('Service Worker: Serving from static cache', url.pathname);
        return cachedResponse;
      }
    }
    
    // Try network first for API routes
    if (isAPIRoute(url.pathname)) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // Cache successful API responses
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, networkResponse.clone());
          console.log('Service Worker: Cached API response', url.pathname);
        }
        return networkResponse;
      } catch (error) {
        console.log('Service Worker: Network failed, trying cache', url.pathname);
        const cachedResponse = await getFromCache(request, DYNAMIC_CACHE);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    }
    
    // For other requests, try network first, then cache
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.log('Service Worker: Network failed, trying cache', url.pathname);
      const cachedResponse = await getFromCache(request, DYNAMIC_CACHE);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Service Worker: Failed to handle request', url.pathname, error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // Return a generic error response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function getFromCache(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    return response;
  } catch (error) {
    console.error('Service Worker: Failed to get from cache', error);
    return null;
  }
}

function isStaticFile(pathname) {
  return STATIC_FILES.includes(pathname) || 
         pathname.startsWith('/_next/static/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
}

function isAPIRoute(pathname) {
  return pathname.startsWith('/api/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'course-progress') {
    event.waitUntil(syncCourseProgress());
  } else if (event.tag === 'user-actions') {
    event.waitUntil(syncUserActions());
  }
});

async function syncCourseProgress() {
  try {
    // Get stored progress data
    const progressData = await getStoredData('course-progress');
    if (progressData && progressData.length > 0) {
      // Sync with server
      const response = await fetch('/api/course-progress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        // Clear stored data after successful sync
        await clearStoredData('course-progress');
        console.log('Service Worker: Course progress synced');
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync course progress', error);
  }
}

async function syncUserActions() {
  try {
    // Get stored user actions
    const actions = await getStoredData('user-actions');
    if (actions && actions.length > 0) {
      // Sync with server
      const response = await fetch('/api/user-actions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actions)
      });
      
      if (response.ok) {
        // Clear stored data after successful sync
        await clearStoredData('user-actions');
        console.log('Service Worker: User actions synced');
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync user actions', error);
  }
}

async function getStoredData(key) {
  try {
    const data = await self.indexedDB.open('skilllink-offline', 1);
    return new Promise((resolve, reject) => {
      const transaction = data.transaction([key], 'readonly');
      const store = transaction.objectStore(key);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Service Worker: Failed to get stored data', error);
    return null;
  }
}

async function clearStoredData(key) {
  try {
    const data = await self.indexedDB.open('skilllink-offline', 1);
    return new Promise((resolve, reject) => {
      const transaction = data.transaction([key], 'readwrite');
      const store = transaction.objectStore(key);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Service Worker: Failed to clear stored data', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from SkillLink',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SkillLink', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

