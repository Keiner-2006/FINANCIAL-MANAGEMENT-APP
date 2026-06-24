const CACHE = 'smartpocket-v1'
const ASSETS = ['/manifest.json', '/icon.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  if (e.request.mode === 'navigate') return

  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request, { redirect: 'follow' }))
  )
})
