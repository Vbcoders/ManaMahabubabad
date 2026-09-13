/* ManaMahabubabad — Firebase Console manual web notifications */
(function(){
  const FIREBASE_CONFIG={apiKey:'AIzaSyAFCAqMsz8RkfS4JpAIVUT27CrWr2cCtJs',authDomain:'chat-fe97c.firebaseapp.com',projectId:'chat-fe97c',storageBucket:'chat-fe97c.firebasestorage.app',messagingSenderId:'577320453917',appId:'1:577320453917:web:fbea459344dc71d1ad03f4'};
  // Paste the PUBLIC Web Push certificate key from Firebase Console here.
  // Firebase Console → Project settings → Cloud Messaging → Web Push certificates.
  const VAPID_KEY='';
  const SDK='https://www.gstatic.com/firebasejs/10.14.1/';
  let ready=null;

  const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Failed to load '+src));document.head.appendChild(s)});

  async function init(){
    if(ready)return ready;
    ready=(async()=>{
      await load(SDK+'firebase-app-compat.js');
      await load(SDK+'firebase-messaging-compat.js');
      if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
      const supported=await firebase.messaging.isSupported();
      if(!supported)throw new Error('This browser does not support Firebase web push notifications.');
      const registration=await navigator.serviceWorker.register('./firebase-messaging-sw.js');
      const messaging=firebase.messaging();
      return{messaging,registration};
    })();
    return ready;
  }

  async function enableNotifications(){
    try{
      if(!('Notification'in window)||!('serviceWorker'in navigator)){
        toastPush('ఈ బ్రౌజర్ notifications కు support చేయడం లేదు.');return;
      }
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){toastPush('Notifications permission denied.');return}
      const{messaging,registration}=await init();
      const options={serviceWorkerRegistration:registration};
      if(VAPID_KEY)options.vapidKey=VAPID_KEY;
      const token=await messaging.getToken(options);
      if(!token)throw new Error('Firebase did not return a notification token.');

      localStorage.setItem('mm-push-enabled','true');
      localStorage.setItem('mm-fcm-token',token);
      showTokenBox(token);
      const b=document.querySelector('#notifyBtn');if(b)b.textContent='🔔 Notifications Enabled';
      toastPush('Notifications enabled. Your Firebase test token is ready.');
    }catch(e){
      console.error('[ManaMahabubabad Push]',e);
      toastPush(e.message||'Notifications setup failed.');
    }
  }

  function showTokenBox(token){
    let box=document.querySelector('#mmPushTokenBox');
    if(!box){
      box=document.createElement('div');box.id='mmPushTokenBox';
      box.innerHTML=`<div class="mm-push-token-card"><div class="mm-push-token-title">🔔 Firebase Notifications Enabled</div><p>Use this FCM registration token in Firebase Console → Messaging → Send test message.</p><textarea id="mmFcmToken" readonly></textarea><div class="mm-push-token-actions"><button id="mmCopyToken" type="button">Copy Token</button><button id="mmHideToken" type="button">Close</button></div><small>For normal manual campaigns, use Firebase Console's Notifications composer. The token below is mainly for testing this browser.</small></div>`;
      document.body.appendChild(box);
      const style=document.createElement('style');style.textContent=`#mmPushTokenBox{position:fixed;inset:0;z-index:10000;background:#0009;display:grid;place-items:center;padding:16px}.mm-push-token-card{width:min(620px,96vw);background:#fff;color:#171717;border-radius:18px;padding:22px;box-shadow:0 25px 90px #0008}.mm-push-token-title{font-size:20px;font-weight:800;margin-bottom:8px}.mm-push-token-card p{font-size:13px;line-height:1.5;color:#555}.mm-push-token-card textarea{width:100%;height:120px;resize:none;padding:10px;border:1px solid #ddd;border-radius:10px;font-size:11px;word-break:break-all}.mm-push-token-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}.mm-push-token-actions button{border:0;border-radius:9px;padding:10px 15px;cursor:pointer}.mm-push-token-actions button:first-child{background:#b91c1c;color:#fff}.mm-push-token-card small{display:block;margin-top:10px;color:#777;line-height:1.4}`;document.head.appendChild(style);
      box.querySelector('#mmCopyToken').onclick=async()=>{try{await navigator.clipboard.writeText(token);box.querySelector('#mmCopyToken').textContent='✓ Copied'}catch(e){const t=box.querySelector('#mmFcmToken');t.select();document.execCommand('copy');box.querySelector('#mmCopyToken').textContent='✓ Copied'}};
      box.querySelector('#mmHideToken').onclick=()=>box.remove();
    }
    box.querySelector('#mmFcmToken').value=token;box.style.display='grid';
  }

  async function showForeground(payload){
    const d=payload?.data||{},title=payload?.notification?.title||d.title||'ManaMahabubabad',body=payload?.notification?.body||d.body||'కొత్త వార్త వచ్చింది.';
    if(Notification.permission==='granted'){
      const reg=await navigator.serviceWorker.ready;
      reg.showNotification(title,{body,icon:'./favicon.ico',data:{url:d.url||location.href}});
    }
  }

  async function openNewsFromQuery(){
    const id=new URLSearchParams(location.search).get('news');if(!id)return;
    try{
      const url='https://firestore.googleapis.com/v1/projects/'+FIREBASE_CONFIG.projectId+'/databases/(default)/documents/news/'+encodeURIComponent(id)+'?key='+encodeURIComponent(FIREBASE_CONFIG.apiKey);
      const r=await fetch(url);if(!r.ok)return;const j=await r.json(),f=j.fields||{},title=f.title?.stringValue||'',content=f.content?.stringValue||'';
      if(title&&typeof openStaticArticle==='function')setTimeout(()=>openStaticArticle(title,content),900);
    }catch(e){console.log('[ManaMahabubabad Push] article open skipped',e)}
  }

  function toastPush(text){if(typeof toast==='function')toast(text);else console.log(text)}
  window.enableNotifications=enableNotifications;
  window.ManaPush={init,enableNotifications};

  document.addEventListener('DOMContentLoaded',()=>{
    const b=document.querySelector('#notifyBtn');
    if(b&&localStorage.getItem('mm-push-enabled')==='true')b.textContent='🔔 Notifications Enabled';
    init().then(({messaging})=>messaging.onMessage(showForeground)).catch(()=>{});
    openNewsFromQuery();
  });
})();
