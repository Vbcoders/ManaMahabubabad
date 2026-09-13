/* ManaMahabubabad Web Push client */
(function(){
  const FIREBASE_CONFIG={apiKey:'AIzaSyAFCAqMsz8RkfS4JpAIVUT27CrWr2cCtJs',authDomain:'chat-fe97c.firebaseapp.com',projectId:'chat-fe97c',storageBucket:'chat-fe97c.firebasestorage.app',messagingSenderId:'577320453917',appId:'1:577320453917:web:fbea459344dc71d1ad03f4'};
  const SDK='https://www.gstatic.com/firebasejs/10.14.1/';
  let ready=null;
  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Failed to load '+src));document.head.appendChild(s)});
  async function init(){
    if(ready)return ready;
    ready=(async()=>{
      await load(SDK+'firebase-app-compat.js');
      await load(SDK+'firebase-messaging-compat.js');
      if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
      if(!firebase.messaging.isSupported())throw new Error('This browser does not support web push notifications.');
      const registration=await navigator.serviceWorker.register('./firebase-messaging-sw.js');
      const messaging=firebase.messaging();
      return {messaging,registration};
    })();
    return ready;
  }
  function tokenId(token){return btoa(unescape(encodeURIComponent(token))).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,1500)}
  async function enableNotifications(){
    try{
      if(!('Notification' in window)||!('serviceWorker' in navigator)){alert('ఈ బ్రౌజర్ notifications కు support చేయడం లేదు.');return}
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){toastPush('Notifications permission denied.');return}
      const {messaging,registration}=await init();
      const token=await messaging.getToken({serviceWorkerRegistration:registration});
      if(!token)throw new Error('Firebase did not return a notification token.');
      const payload={token,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),userAgent:navigator.userAgent.slice(0,500),platform:navigator.platform||''};
      await saveToken(payload,token);
      localStorage.setItem('mm-push-enabled','true');
      const b=document.querySelector('#notifyBtn');if(b)b.textContent='🔔 Notifications Enabled';
      toastPush('News notifications enabled successfully.');
      messaging.onMessage(payload=>showForeground(payload));
    }catch(e){console.error('[ManaMahabubabad Push]',e);toastPush(e.message||'Notifications setup failed. Check Firebase Messaging setup.')}
  }
  async function saveToken(payload,token){
    const app=firebase.app();
    const res=await fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(app.options.projectId)+'/databases/(default)/documents/notificationTokens/'+tokenId(token)+'?key='+encodeURIComponent(app.options.apiKey),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{token:{stringValue:payload.token},createdAt:{timestampValue:new Date().toISOString()},updatedAt:{timestampValue:new Date().toISOString()},userAgent:{stringValue:payload.userAgent},platform:{stringValue:payload.platform}}})});
    if(!res.ok)throw new Error('Could not save notification subscription. Publish the updated Firestore rules first.');
  }
  async function showForeground(payload){
    const d=payload?.data||{};
    const title=d.title||payload?.notification?.title||'ManaMahabubabad';
    const options={body:d.body||payload?.notification?.body||'కొత్త వార్త వచ్చింది.',icon:'./favicon.ico',image:d.image||undefined,data:{url:d.url||location.href}};
    if(Notification.permission==='granted'){
      const reg=await navigator.serviceWorker.ready;
      reg.showNotification(title,options);
    }
  }
  function toastPush(text){
    if(typeof toast==='function')toast(text);else console.log(text);
  }
  window.enableNotifications=enableNotifications;
  window.ManaPush={init,enableNotifications};
  document.addEventListener('DOMContentLoaded',()=>{
    const b=document.querySelector('#notifyBtn');
    if(b){
      b.addEventListener('click',enableNotifications);
      if(localStorage.getItem('mm-push-enabled')==='true')b.textContent='🔔 Notifications Enabled';
    }
    init().then(({messaging})=>messaging.onMessage(showForeground)).catch(()=>{});
  });
})();
