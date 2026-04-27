//-----------------------------------------------------------------------------
//
// ### PWA Bunga! Service Worker
//
//     Documentation of serviceworker.js
//     ---------------------------------
//     https://pwabunga.com/documentation/pwa/serviceworker.html
//
//-----------------------------------------------------------------------------

//--------------------------------------------------------------------
//
// ### Cache & Request Processing Strategy
//
//--------------------------------------------------------------------

// # Cache Config
//---------------

// -- Cache name and version
const cacheTitle = 'Qunut'
const cacheVersion = 'v1.0'
const cacheName = cacheTitle + '-' + cacheVersion

// -- static assets
const contentToCache = [
  // - Pages
  '/',
  'index.html',
  // - Favicons
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  // - CSS
  'assets/css/pwabunga.css',
  'assets/css/styles.css',
  // - JS
  'assets/js/scripts.js',
  // - PWA
  'pwa/css/pwabunga-ui.css',
  'pwa/icons/apple-touch-icon.png',
  'pwa/icons/icon-192.png',
  'pwa/icons/icon-512.png',
  'pwa/icons/icon-maskable-192.png',
  'pwa/icons/icon-maskable-512.png',
  'pwa/js/pwabunga.js',
  'pwa/app.webmanifest'
]

// # Request Processing Strategy Config 
//-------------------------------------

// -- Request Processing Strategy
const requestProcessingMethod = 'cacheFirst'

// -- Dynamic folder (Network Only Request Processing)
const dynamicFolder = '/api/'

//--------------------------------------------------------------------
// ## Add to cache 
//--------------------------------------------------------------------

// # Add Resources to cache
//-------------------------

const addResourcesToCache = async (resources) => {
  // -- Open the cache with the specified name (cacheName)
  const cache = await caches.open(cacheName)
  // -- Add all resources in the resources array to the cache
  await cache.addAll(resources)
}

// # Put request to cache
//-----------------------

const putInCache = async (request, response) => {
  // -- Open the cache with the specified name (cacheName)
  const cache = await caches.open(cacheName)
  // -- Add the response to the cache for the given request
  await cache.put(request, response)
}

//--------------------------------------------------------------------
// ## Delete cache 
//--------------------------------------------------------------------

// # Delete cache
//---------------

const deleteCache = async (key) => {
  // -- Delete the cache with the specified key
  await caches.delete(key)
}

// # Delete old caches
//--------------------

const deleteOldCaches = async () => {
  // -- Define the cache to keep
  const cacheKeepList = [cacheName]
  // -- Get a list of all cache keys
  const keyList = await caches.keys()
  // -- Filter the list of keys to caches that are not in the keep list
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key))
  // -- Delete all caches to be deleted
  await Promise.all(cachesToDelete.map(deleteCache))
}

//--------------------------------------------------------------------
// ## Request Processing method 
//--------------------------------------------------------------------

// # Cache Only
//-------------

const cacheOnly = async ({ request }) => {
  // -- Try to match the request with a cached response
  const responseFromCache = await caches.match(request)
  // -- If a cached response is found
  if (responseFromCache) {
    // - Return the response from cache
    return responseFromCache
  } else {
    // - If no cached response is found
    return new Response("No cached response found", {
      // Return a 404 response with a plain text error message
      status: 404,
      headers: { "Content-Type": "text/plain" }
    })
  }
}

// # Network Only
//---------------

const networkOnly = async ({ request }) => {
  try {
    // -- Try to fetch the request from the network
    const responseFromNetwork = await fetch(request)
    // -- If the network request succeeds, return the response
    return responseFromNetwork
  } catch (error) {
    // -- If the network request fails
    return new Response("Network error happened", {
      // - Return a 408 response with a plain text error message
      status: 408,
      headers: { "Content-Type": "text/plain" }
    })
  }
}

// # Cache first method
//---------------------

const cacheFirst = async ({ request }) => {
  // -- If the request URL includes the dynamicFolder
  if (request.url.includes(dynamicFolder)) {
    // - Always fetch it from the network
    return fetch(request)
  }
  // -- Try to match the request with a cached response
  const responseFromCache = await caches.match(request)
  // -- If a cached response is found
  if (responseFromCache) {
    // Return it
    return responseFromCache
  }
  // -- If the response is not in cache
  try {
    // - Try to fetch it from the network
    const responseFromNetwork = await fetch(request)
    // - Cache the response
    putInCache(request, responseFromNetwork.clone())
    // - Return the response from network
    return responseFromNetwork
  } catch (error) {
    // - If there is a network error, return an error message
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" }
    })
  }
}

// # Network first method
//-----------------------

const networkFirst = async ({ request }) => {
  try {
    // -- Try to fetch the resource from the network
    const responseFromNetwork = await fetch(request)
    // -- If the network request is successful, store a copy of the response in cache
    putInCache(request, responseFromNetwork.clone())
    // -- Return the response from networkr
    return responseFromNetwork
  } catch (error) {
    // -- If there was an error fetching from the network, attempt to retrieve the response from cache
    const responseFromCache = await caches.match(request)
    // -- If the cached response exists
    if (responseFromCache) {
      // - Return the response from cache
      return responseFromCache
    }
    // -- If there was no cached response and the network request failed
    return new Response("Network error happened", {
      // - return a 408 response with a plain text error message
      status: 408,
      headers: { "Content-Type": "text/plain" }
    })
  }
}

// # Stale while revalidate method
//--------------------------------

const staleWhileRevalidate = async ({ request }) => {
  // -- open cache
  const cache = await caches.open(cacheName)
  // -- check if response is in cache
  const responseFromCache = await caches.match(request)
  // -- fetch response from network
  const responseFromNetwork = fetch(request)
  // -- If a cached response is found
  if (responseFromCache) {
    // - Clone the cached response to avoid modifying the original
    const responseClone = responseFromCache.clone()
    // - Asynchronously fetch a fresh response from the network
    responseFromNetwork.then(response => {
      // Put the fresh response into the cache
      cache.put(request, response.clone())
    })
    // - Return the cached response to the user
    return responseClone
  } 
  try {
    // - Attempt to fetch the request from the network
    const response = await responseFromNetwork
    // - If successful, put the response in the cache
    cache.put(request, response.clone())
    // - Return it
    return response
  } catch (error) {
    // - If an error occurs
    return new Response('Network error occurred.', {
      // return a 408 response with a plain text error message
      status: 408,
      statusText: 'Request Timeout',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

//--------------------------------------------------------------------
//
// ### Service Worker Events
//
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// ## Service Worker Install
//--------------------------------------------------------------------

// -- The service worker's "install" event listener
self.addEventListener('install', (event) => {
  // - Log the installation message
  console.log(cacheName + ' Installation')
  // - Wait until the resources are added to the cache
  event.waitUntil(
    addResourcesToCache(contentToCache)
  )
})

//--------------------------------------------------------------------
// ## Service Worker Activate
//--------------------------------------------------------------------

// -- The service worker's "activate" event listener
self.addEventListener('activate', (event) => {
  // - This event is triggered when the service worker is activated
  event.waitUntil(
    // Wait until the deleteOldCaches function has finished running
    deleteOldCaches()
  )
})

//--------------------------------------------------------------------
// ## Service Worker Message
//--------------------------------------------------------------------

// -- The service worker's "message" event listener
self.addEventListener('message', (event) => {
  // - If the message is 'SKIP_WAITING'
  if (event.data === 'SKIP_WAITING') {
    // Call the skipWaiting method to activate the service worker immediately
      self.skipWaiting()
  }
  // - If the message is 'GET_VERSION'
  if (event.data === 'GET_VERSION') {
    // Send the cache version to all clients associated with the Service Worker
    self.clients.matchAll().then(function(clients) {
      // For each client
      clients.forEach(function(client) {
        // Send a message containing the cache version
        client.postMessage(cacheVersion)
      })
    })
  }
})

//--------------------------------------------------------------------
// ## Service Worker Responses to requests
//--------------------------------------------------------------------

// -- The service worker's "message" event listener
self.addEventListener('fetch', (event) => {
  // - Get the request object from the event
  const request = event.request
  // - Define a mapping of request processing methods
  const methods = {
    'cacheOnly': cacheOnly,
    'networkOnly': networkOnly,
    'cacheFirst': cacheFirst,
    'networkFirst': networkFirst,
    'staleWhileRevalidate': staleWhileRevalidate
  }
  // - Get the processing method from the mapping based on the current request processing method
  const method = methods[requestProcessingMethod]
  // - If a processing method exists for the current request processing method 
  if (method) {
    // Use it to handle the request
    event.respondWith(method({request}))
  }
})
