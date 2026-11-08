const CACHE_NAME = "calculadora-financeira-v1";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icon-192.svg",
    "./icon-512.svg"
];

// INSTALAÇÃO

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ARQUIVOS);
        })

    );

    self.skipWaiting();

});


// ATIVAÇÃO

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(chaves => {

            return Promise.all(

                chaves
                    .filter(chave => chave !== CACHE_NAME)
                    .map(chave => caches.delete(chave))

            );

        })

    );

    self.clients.claim();

});


// CACHE E FUNCIONAMENTO OFFLINE

self.addEventListener("fetch", event => {

    const requisicao = event.request;

    if (requisicao.method !== "GET") return;

    const url = new URL(requisicao.url);

    // Arquivos do Tailwind CDN

    if (url.hostname === "cdn.tailwindcss.com") {

        event.respondWith(

            caches.match(requisicao).then(async resposta => {

                if (resposta) return resposta;

                try {

                    const novaResposta = await fetch(requisicao);

                    if (novaResposta.ok) {

                        const cache = await caches.open(CACHE_NAME);

                        await cache.put(
                            requisicao,
                            novaResposta.clone()
                        );

                    }

                    return novaResposta;

                } catch (erro) {

                    return new Response("", {
                        status: 503
                    });

                }

            })

        );

        return;

    }

    // Arquivos do próprio aplicativo

    if (url.origin === self.location.origin) {

        event.respondWith(

            caches.match(requisicao).then(async resposta => {

                if (resposta) return resposta;

                try {
                    return await fetch(requisicao);
                } catch (erro) {

                    if (requisicao.mode === "navigate") {

                        return caches.match("./index.html");

                    }

                    return new Response("Arquivo indisponível offline.", {
                        status: 503
                    });

                }

            })

        );

    }

});
