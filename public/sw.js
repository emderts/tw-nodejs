// ThirdWorld PWA 서비스 워커 — 정적 자원만 캐시, 페이지·소켓은 항상 네트워크
const CACHE = 'tw-static-v1';
const STATIC = ['/stylesheets/main.css', '/js/ui.js', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/socket.io')) return;
  const isStatic = /^\/(stylesheets|js|icons)\//.test(url.pathname) || url.pathname === '/manifest.json';
  if (isStatic) {
    // 정적: 캐시 우선, 뒤에서 갱신
    e.respondWith(caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone())); return res; }).catch(() => hit);
      return hit || net;
    }));
  } else {
    // 페이지: 네트워크 우선, 실패 시 오프라인 안내
    e.respondWith(fetch(e.request).catch(() => new Response('<!doctype html><meta charset="utf-8"><body style="background:#181c28;color:#e6e2d6;font-family:sans-serif;padding:40px;text-align:center"><h2>연결이 없습니다</h2><p>ThirdWorld는 서버와 연결되어야 플레이할 수 있어요.</p><p><a href="/" style="color:#c4a052">다시 시도</a></p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
  }
});
