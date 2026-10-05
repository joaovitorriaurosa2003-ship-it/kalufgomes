// Service worker do app Auditoria Balcão (Moreira e Filhos).
// Registrado com escopo restrito a /auditoriamoreira.html, então
// não controla o index.html nem as outras páginas do site.
// Só cacheia arquivos do próprio site; Firebase, fontes e CDNs passam direto.
const CACHE_NAME = "auditoria-moreira-v1";
const CORE_ASSETS = [
  "./auditoriamoreira.html",
  "./auditoria-moreira/manifest.json",
  "./auditoria-moreira/assets/logo-moreira.png",
  "./auditoria-moreira/assets/logo-kaluf-gomes.jpg",
  "./auditoria-moreira/icons/icon-192.png",
  "./auditoria-moreira/icons/icon-512.png",
  "./auditoria-moreira/icons/favicon-32.png",
  "./auditoria-moreira/icons/apple-touch-icon.png",
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
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("./auditoriamoreira.html") : undefined))
      )
  );
});
