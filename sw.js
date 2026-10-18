// Keeps the app and its libraries on this device so it opens without internet.
const V='pp-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/favicon-32.png','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);
  await c.addAll(SHELL);
  for(const u of CDN){try{await c.put(u,await fetch(new Request(u,{mode:'no-cors'})))}catch(_){}}
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V)await caches.delete(k);
  await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(!same){ // libraries and fonts: cache first
      const hit=await c.match(r);if(hit)return hit;
      try{const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}catch(_){return Response.error()}
    }
    try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res} // app files: network first, so updates arrive
    catch(_){return (await c.match(r,{ignoreSearch:true}))||(await c.match('index.html'))||Response.error()}
  })());
});
