/* ManaMahabubabad — Firebase Console manual web notifications */
(function(){
  const FIREBASE_CONFIG={apiKey:'AIzaSyAFCAqMsz8RkfS4JpAIVUT27CrWr2cCtJs',authDomain:'chat-fe97c.firebaseapp.com',projectId:'chat-fe97c',storageBucket:'chat-fe97c.firebasestorage.app',messagingSenderId:'577320453917',appId:'1:577320453917:web:fbea459344dc71d1ad03f4',measurementId:'G-86YZ76HRJ3'};
  const VAPID_KEY='BDUyQAZQZ73h7pP0NJCJrAC-mRP7kmzmGWLS7jvRFEGxaIA-DLgI6bpbWz_5VoV-ATnYMo6qhDyRNDYZmUvCpQo';
  const SDK='https://www.gstatic.com/firebasejs/10.14.1/';
  let ready=null;
  const load=src=>new Promise((ok,no)=>{
    if(document.querySelector('script[src="'+src+'"]'))return ok();
    const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Failed to load '+src));document.head.appendChild(s)
  });
  async function waitForActiveServiceWorker(registration){
    if(registration.active)return registration;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Firebase Messaging service worker did not become active in time. Please refresh the page and try again.')),15000);
      const finish=()=>{clearTimeout(timer);resolve()};
      if(registration.active)return finish();
      if(registration.installing)registration.installing.addEventListener('statechange',()=>{if(registration.active||registration.installing?.state==='activated')finish()});
      if(registration.waiting)registration.waiting.addEventListener('statechange',()=>{if(registration.active||registration.waiting?.state==='activated')finish()});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(registration.active)finish()},{once:true});
    });
    return registration;
  }
  async function init(){
    if(ready)return ready;
    ready=(async()=>{
      if(!window.firebase){
        await load(SDK+'firebase-app-compat.js');
      }
      if(!window.firebase?.messaging){
        await load(SDK+'firebase-messaging-compat.js');
      }
      if(!window.firebase?.analytics){
        try{await load(SDK+'firebase-analytics-compat.js')}catch(e){}
      }
      if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
      let analytics=null;try{if(firebase.analytics)analytics=firebase.analytics()}catch(e){}
      const supported=await firebase.messaging.isSupported();
      if(!supported)throw new Error('This browser does not support Firebase web push notifications.');
      const registration=await navigator.serviceWorker.register('./firebase-messaging-sw.js');
      await waitForActiveServiceWorker(registration);
      const activeRegistration=await navigator.serviceWorker.ready;
      if(!activeRegistration.active)throw new Error('Firebase Messaging service worker is not active. Please refresh and try again.');
      return{messaging:firebase.messaging(),registration:activeRegistration,analytics};
    })();
    try{return await ready}catch(e){ready=null;throw e}
  }
  async function enableNotifications(){
    try{
      if(!('Notification'in window)||!('serviceWorker'in navigator)){toastPush('ఈ బ్రౌజర్ notifications కు support చేయడం లేదు.');return}
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){localStorage.removeItem('mm-push-enabled');toastPush('Notifications permission denied.');return}
      if(!VAPID_KEY)throw new Error('Firebase Web Push key is not configured.');
      const{messaging,registration,analytics}=await init();
      console.log('[ManaMahabubabad Push] Active service worker:',registration.active?.state);
      const token=await messaging.getToken({serviceWorkerRegistration:registration,vapidKey:VAPID_KEY});
      if(!token)throw new Error('Firebase did not return a notification token.');
      localStorage.setItem('mm-push-enabled','true');
      localStorage.setItem('mm-fcm-token',token);
      localStorage.setItem('mm-notification-choice','granted');
      if(analytics){try{analytics.setUserProperties({push_opt_in:'true'});analytics.logEvent('push_opt_in',{method:'web_push'})}catch(e){}}
      showTokenBox(token);
      const b=document.querySelector('#notifyBtn');if(b)b.textContent='🔔 Notifications Enabled';
      toastPush('Notifications enabled successfully.');
    }catch(e){
      console.error('[ManaMahabubabad Push]',e);
      localStorage.removeItem('mm-push-enabled');
      toastPush(e.message||'Notifications setup failed.');
    }
  }
  function showTokenBox(token){
    let box=document.querySelector('#mmPushTokenBox');
    if(!box){
      box=document.createElement('div');box.id='mmPushTokenBox';
      box.innerHTML=`<div class="mm-push-token-card"><div class="mm-push-token-title">🔔 Firebase Notifications Enabled</div><p>This browser is subscribed to Firebase Cloud Messaging. The token below belongs only to this browser and is for testing.</p><textarea id="mmFcmToken" readonly></textarea><div class="mm-push-token-actions"><button id="mmCopyToken" type="button">Copy My Token</button><button id="mmHideToken" type="button">Close</button></div><small>For normal campaigns use Firebase Console → Messaging → Notifications composer → User segment. Other users' tokens are never exposed.</small></div>`;
      document.body.appendChild(box);
      const style=document.createElement('style');style.textContent=`#mmPushTokenBox{position:fixed;inset:0;z-index:10000;background:#0009;display:grid;place-items:center;padding:16px}.mm-push-token-card{width:min(620px,96vw);background:#fff;color:#171717;border-radius:18px;padding:22px;box-shadow:0 25px 90px #0008}.mm-push-token-title{font-size:20px;font-weight:800;margin-bottom:8px}.mm-push-token-card p{font-size:13px;line-height:1.5;color:#555}.mm-push-token-card textarea{width:100%;height:120px;resize:none;padding:10px;border:1px solid #ddd;border-radius:10px;font-size:11px;word-break:break-all}.mm-push-token-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}.mm-push-token-actions button{border:0;border-radius:9px;padding:10px 15px;cursor:pointer}.mm-push-token-actions button:first-child{background:#b91c1c;color:#fff}.mm-push-token-card small{display:block;margin-top:10px;color:#777;line-height:1.4}`;document.head.appendChild(style);
      box.querySelector('#mmCopyToken').onclick=async()=>{try{await navigator.clipboard.writeText(token);box.querySelector('#mmCopyToken').textContent='✓ Copied'}catch(e){const t=box.querySelector('#mmFcmToken');t.select();document.execCommand('copy');box.querySelector('#mmCopyToken').textContent='✓ Copied'}};
      box.querySelector('#mmHideToken').onclick=()=>box.remove();
    }
    box.querySelector('#mmFcmToken').value=token;box.style.display='grid';
  }
  async function showForeground(payload){const d=payload?.data||{},title=payload?.notification?.title||d.title||'ManaMahabubabad',body=payload?.notification?.body||d.body||'కొత్త వార్త వచ్చింది.';if(Notification.permission==='granted'){const reg=await navigator.serviceWorker.ready;reg.showNotification(title,{body,icon:'./favicon.ico',image:d.image||undefined,data:{url:d.url||location.href}})}}
  async function openNewsFromQuery(){const id=new URLSearchParams(location.search).get('news');if(!id)return;try{const url='https://firestore.googleapis.com/v1/projects/'+FIREBASE_CONFIG.projectId+'/databases/(default)/documents/news/'+encodeURIComponent(id)+'?key='+encodeURIComponent(FIREBASE_CONFIG.apiKey);const r=await fetch(url);if(!r.ok)return;const j=await r.json(),f=j.fields||{},title=f.title?.stringValue||'',content=f.content?.stringValue||'';if(title&&typeof openStaticArticle==='function')setTimeout(()=>openStaticArticle(title,content),900)}catch(e){}}
  function toastPush(text){if(typeof toast==='function')toast(text);else console.log(text)}
  window.enableNotifications=enableNotifications;window.ManaPush={init,enableNotifications};
  document.addEventListener('DOMContentLoaded',()=>{const b=document.querySelector('#notifyBtn');if(b&&localStorage.getItem('mm-push-enabled')==='true'&&localStorage.getItem('mm-fcm-token'))b.textContent='🔔 Notifications Enabled';init().then(({messaging})=>messaging.onMessage(showForeground)).catch(e=>console.warn('[ManaMahabubabad Push init]',e));openNewsFromQuery()});
})();
