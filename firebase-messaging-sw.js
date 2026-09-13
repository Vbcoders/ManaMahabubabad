/* ManaMahabubabad Firebase Messaging service worker */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:'AIzaSyAFCAqMsz8RkfS4JpAIVUT27CrWr2cCtJs',
  authDomain:'chat-fe97c.firebaseapp.com',
  projectId:'chat-fe97c',
  storageBucket:'chat-fe97c.firebasestorage.app',
  messagingSenderId:'577320453917',
  appId:'1:577320453917:web:fbea459344dc71d1ad03f4'
});

const messaging=firebase.messaging();
const PROJECT='chat-fe97c';
const API_KEY='AIzaSyAFCAqMsz8RkfS4JpAIVUT27CrWr2cCtJs';

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
