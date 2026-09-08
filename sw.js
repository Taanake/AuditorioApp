const CACHE_NAME = "auditorio-cache-v3";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./recorte-avateres.json",
    "./imagens/Auditorio.png",
    "./imagens/icon-192.png",
    "./imagens/icon-512.png",
    "./imagens/1.png",
    "./imagens/10.png",
    "./imagens/11.png",
    "./imagens/12.png",
    "./imagens/13.png",
    "./imagens/14.png",
    "./imagens/15.png",
    "./imagens/16.png",
    "./imagens/17.png",
    "./imagens/18.png",
    "./imagens/19.png",
    "./imagens/2.png",
    "./imagens/20.png",
    "./imagens/21.png",
    "./imagens/22.png",
    "./imagens/23.png",
    "./imagens/24.png",
    "./imagens/25.png",
    "./imagens/26.png",
    "./imagens/27.png",
    "./imagens/28.png",
    "./imagens/29.png",
    "./imagens/3.png",
    "./imagens/30.png",
    "./imagens/31.png",
    "./imagens/32.png",
    "./imagens/33.png",
    "./imagens/34.png",
    "./imagens/35.png",
    "./imagens/36.png",
    "./imagens/37.png",
    "./imagens/38.png",
    "./imagens/39.png",
    "./imagens/4.png",
    "./imagens/40.png",
    "./imagens/41.png",
    "./imagens/42.png",
    "./imagens/43.png",
    "./imagens/44.png",
    "./imagens/45.png",
    "./imagens/46.png",
    "./imagens/47.png",
    "./imagens/5.png",
    "./imagens/6.png",
    "./imagens/7.png",
    "./imagens/8.png",
    "./imagens/9.png",
    "./imagens/visitante homem 1.png",
    "./imagens/visitante homem 10.png",
    "./imagens/visitante homem 2.png",
    "./imagens/visitante homem 3.png",
    "./imagens/visitante homem 4.png",
    "./imagens/visitante homem 5.png",
    "./imagens/visitante homem 6.png",
    "./imagens/visitante homem 7.png",
    "./imagens/visitante homem 8.png",
    "./imagens/visitante homem 9.png",
    "./imagens/visitante mulher 1.png",
    "./imagens/visitante mulher 10.png",
    "./imagens/visitante mulher 2.png",
    "./imagens/visitante mulher 3.png",
    "./imagens/visitante mulher 4.png",
    "./imagens/visitante mulher 5.png",
    "./imagens/visitante mulher 6.png",
    "./imagens/visitante mulher 7.png",
    "./imagens/visitante mulher 8.png",
    "./imagens/visitante mulher 9.png"
];

self.addEventListener("install", function (evento) {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_SHELL);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", function (evento) {
    evento.waitUntil(
        caches.keys().then(function (nomesCaches) {
            return Promise.all(
                nomesCaches
                    .filter(function (nome) {
                        return nome !== CACHE_NAME;
                    })
                    .map(function (nome) {
                        return caches.delete(nome);
                    })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (evento) {
    if (evento.request.method !== "GET") {
        return;
    }

    if (evento.request.mode === "navigate") {
        evento.respondWith(
            fetch(evento.request)
                .then(function (resposta) {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(evento.request, copia);
                    });
                    return resposta;
                })
                .catch(function () {
                    return caches.match(evento.request)
                        .then(function (resposta) {
                            return resposta || caches.match("./index.html");
                        });
                })
        );
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then(function (emCache) {
            if (emCache) {
                return emCache;
            }

            return fetch(evento.request).then(function (resposta) {
                if (resposta && resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(evento.request, copia);
                    });
                }
                return resposta;
            });
        })
    );
});
