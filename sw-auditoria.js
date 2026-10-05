// Service worker do app Auditoria Balcão (Pão Delícia).
// Registrado com escopo restrito a /auditoriapaodelicia.html, então
// não controla o index.html nem as outras páginas do site.
// Só cacheia arquivos do próprio site; Firebase, fontes e CDNs passam direto.
const CACHE_NAME = "auditoria-pd-v1";
const CORE_ASSETS = [
  "./auditoriapaodelicia.html",
  "./auditoria-pd/manifest.json",
  "./auditoria-pd/assets/logo-pao-delicia.png",
  "./auditoria-pd/assets/logo-kaluf-gomes.jpg",
  "./auditoria-pd/icons/icon-192.png",
  "./auditoria-pd/icons/icon-512.png",
  "./auditoria-pd/icons/favicon-32.png",
  "./auditoria-pd/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("auditoria-pd-") && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("./auditoriapaodelicia.html") : undefined))
      )
  );
});
