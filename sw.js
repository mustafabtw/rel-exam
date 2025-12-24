// Versiyonu değiştirdik (V8) ki telefon yeni dosyayı algılasın
const CACHE_NAME = 'rel-exam-v8-offline-fix';

// Önbelleğe alınacak dosyalar listesi
// BURASI ÇOK ÖNEMLİ: Dosya isimlerin birebir tutmalı!
const assets = [
  './',
  './tasinmaz.html',        // <-- Senin ana dosyan bu
  './manifest.json',
  './bovkir.jpeg',          // Hoca resmi
  './icon-192.png',         // Varsa ikonlar
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// 1. Yükleme (Install) Olayı
self.addEventListener('install', e => {
  self.skipWaiting(); // Yeni versiyonu beklemeden aktif et
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Dosyalar önbelleğe alınıyor...');
      return cache.addAll(assets);
    })
  );
});

// 2. Aktifleştirme (Activate) Olayı - Eski önbellekleri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Eski önbellek siliniyor:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. İstek Yakalama (Fetch) Olayı - İnternet yoksa önbellekten ver
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // Önbellekte varsa onu döndür, yoksa internetten çek
      return response || fetch(e.request).catch(() => {
        // İnternet de yoksa ve ana sayfa isteniyorsa tasinmaz.html'i zorla döndür
        if (e.request.mode === 'navigate') {
          return caches.match('./tasinmaz.html');
        }
      });
    })
  );
});