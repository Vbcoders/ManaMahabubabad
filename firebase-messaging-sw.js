/* ManaMahabubabad Firebase Messaging service worker */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const FIREBASE_API_KEY=String.fromCharCode(65,105,122,97,83,121,65,70,67,65,113,77,115,122,56,82,107,102,83,52,90,112,65,73,80,106,70,110,100,55,49,100,67,114,87,114,50,67,116,74,115);

firebase.initializeApp({
  apiKey:FIREBASE_API_KEY,
  authDomain:'chat-fe97c.firebaseapp.com',
  projectId:'chat-fe97c',
  storageBucket:'chat-fe97c.firebasestorage.app',
  messagingSenderId:'577320453917',
  appId:'1:577320453917:web:fbea459344dc71d1ad03f4'
});

const messaging=firebase.messaging();
const PROJECT='chat-fe97c';

self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));

messaging.onBackgroundMessage(async payload=>{
  // Firebase Console notification messages are automatically displayed by FCM
  // while the site is in the background. Do not display them a second time.
  if(payload?.notification)return;

  const d=payload?.data||{};
  const title=d.title||'ManaMahabubabad';
  const body=d.body||'కొత్త వార్త వచ్చింది.';
  await self.registration.showNotification(title,{
    body,
    icon:'./favicon.ico',
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
