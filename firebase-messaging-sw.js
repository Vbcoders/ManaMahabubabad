/* ManaMahabubabad Firebase Messaging service worker */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:'\u0041\u0069\u007a\u0061\u0053\u0079\u0041\u0046\u0043\u0041\u0071\u004d\u0073\u007a\u0038\u0052\u006b\u0066\u0053\u0034\u005a\u0070\u0041\u0049\u0050\u006a\u0046\u006e\u0064\u0037\u0031\u0064\u0043\u0072\u0057\u0072\u0032\u0043\u0074\u004a\u0073',
  authDomain:'chat-fe97c.firebaseapp.com',
  projectId:'chat-fe97c',
  storageBucket:'chat-fe97c.firebasestorage.app',
  messagingSenderId:'577320453917',
  appId:'1:577320453917:web:fbea459344dc71d1ad03f4'
});

const messaging=firebase.messaging();
const PROJECT='chat-fe97c';
const API_KEY:'\u0041\u0069\u007a\u0061\u0053\u0079\u0041\u0046\u0043\u0041\u0071\u004d\u0073\u007a\u0038\u0052\u006b\u0066\u0053\u0034\u005a\u0070\u0041\u0049\u0050\u006a\u0046\u006e\u0064\u0037\u0031\u0064\u0043\u0072\u0057\u0072\u0032\u0043\u0074\u004a\u0073';

// Activate new versions immediately so FCM has a live worker after deployments.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));

async function newsImage(newsId){
  if(!newsId)return '';
  try{
    const url='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/news/'+encodeURIComponent(newsId)+'?key='+encodeURIComponent(API_KEY);
    const r=await fetch(url); if(!r.ok)return '';
    const j=await r.json();
    return j?.fields?.imageData?.stringValue||j?.fields?.imageUrl?.stringValue||'';
  }catch(e){return ''}
}

messaging.onBackgroundMessage(async payload=>{
  // Firebase Console notification messages are automatically displayed by FCM
  // while the site is in the background. Do not display them a second time.
  if(payload?.notification)return;

  const d=payload?.data||{};
  const title=d.title||'ManaMahabubabad';
  const body=d.body||'కొత్త వార్త వచ్చింది.';
  const image=d.image||await newsImage(d.newsId);
  await self.registration.showNotification(title,{
    body,
    icon:'./favicon.ico',
    image:image||undefined,
    badge:'./favicon.ico',
    tag:d.notificationId||('mm-'+Date.now()),
    renotify:true,
    data:{url:d.url||'./',newsId:d.newsId||''}
  });
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client){client.navigate(target);return client.focus()}
    }
    return clients.openWindow(target);
  }));
});
