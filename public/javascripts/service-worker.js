const filesToCache = [
	'/',
	'images/brand.png',
	'images/icon.png',
	'images/icon2.png'
];
const cacheName = 'static-v1';

// install
self.addEventListener('install', event => {
	console.log('installing…');
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			console.log('Caching app ok');
			return cache.addAll(filesToCache);
		})
	);
}); 

// activate
self.addEventListener('activate', event => {
	console.log('now ready to handle fetches!');
	  event.waitUntil(
		caches.keys().then(function(cacheNames) {
			var promiseArr = cacheNames.map(function(item) {
				if (item !== cacheName) {
					// Delete that cached file
					return caches.delete(item);
				}
			});
			return Promise.all(promiseArr);
		})
	); // end e.waitUntil
});

// fetch
self.addEventListener('fetch', event => {
	console.log('now fetch!');
	console.log('event.request:', event.request);
	console.log('[ServiceWorker] Fetch', event.request.url);
});  

self.addEventListener('fetch', event => {
	const dataUrl = 'http://localhost:5000';
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request).then(res =>
				// 存 caches 之前，要先打開 caches.open(dataCacheName)
				caches.open(cacheName)
				.then(function(cache) {
					// cache.put(key, value)
					// 下一次 caches.match 會對應到 event.request
					cache.put(event.request, res.clone());
					return res;
				})
			);
		})
	);
}); 