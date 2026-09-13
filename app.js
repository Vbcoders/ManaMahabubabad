const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const toast=(m)=>{const t=$('#toast');if(!t){console.log(m);return}t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)};

const firebaseConfig={
 apiKey:'AIzaSyD1OSuBIx13ZXlxfispoGNjm-E0yZiuIio',
 authDomain:'chat-fe97c.firebaseapp.com',
 databaseURL:'https://chat-fe97c-default-rtdb.firebaseio.com',
 projectId:'chat-fe97c',
 storageBucket:'chat-fe97c.firebasestorage.app',
 messagingSenderId:'577320453917',
 appId:'1:577320453917:web:9a9d34cc088d0053ad03f4',
 measurementId:'G-H09PJFVCTT'
};

let firebaseReady=false,auth=null,db=null,storage=null;
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
async function initFirebase(){
 try{
  await loadScript('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/12.19.0/firebase-storage-compat.js');
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  auth=firebase.auth();db=firebase.firestore();storage=firebase.storage();firebaseReady=true;
  window.ManaMahabubabad={firebase,auth,db,storage,firebaseConfig};
  auth.onAuthStateChanged(user=>{if(user){localStorage.setItem('mm-auth-state','signed-in');addReporterButton(user)}else{localStorage.removeItem('mm-auth-state');removeDashboardButton()}});
 }catch(err){console.error('Firebase init failed',err);toast('Firebase connection failed — please refresh')}
}

$('#today').textContent=new Intl.DateTimeFormat('te-IN',{dateStyle:'full'}).format(new Date());
$('#year').textContent=new Date().getFullYear();
$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('mm-dark',document.body.classList.contains('dark'))};
if(localStorage.getItem('mm-dark')==='true')document.body.classList.add('dark');
$('#menuBtn').onclick=()=>$('#navLinks').classList.toggle('open');
function openModal(id){const el=$('#'+id);if(el)el.classList.add('open')}
function closeModal(e){e.currentTarget.closest('.modal')?.classList.remove('open')}
$$('[data-close]').forEach(x=>x.onclick=closeModal);
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
$$('[data-open]').forEach(b=>b.onclick=()=>{const card=b.closest('.news-card,.story');const title=card?.querySelector('h2,h3')?.textContent||'మహబూబాబాద్ జిల్లా తాజా వార్త';if($('#modalTitle'))$('#modalTitle').textContent=title;openModal('articleModal')});
$('#reporterBtn')?.addEventListener('click',()=>openModal('loginModal'));
$('#reporterBtn2')?.addEventListener('click',()=>openModal('loginModal'));

$('#loginBtn')?.addEventListener('click',async()=>{
 const email=$('#email')?.value.trim(),pass=$('#password')?.value;
 if(!email||!pass){toast('Email మరియు Password ఇవ్వండి');return}
 if(!firebaseReady){toast('Firebase ఇంకా loading అవుతోంది');return}
 const btn=$('#loginBtn');btn.disabled=true;
 try{await auth.signInWithEmailAndPassword(email,pass);localStorage.setItem('mm-last-reporter',email);toast('Reporter login successful');$('#loginModal')?.classList.remove('open');showReporterDashboard(auth.currentUser)}
 catch(err){console.error(err);toast(err.code==='auth/invalid-credential'?'Email లేదా Password తప్పుగా ఉంది':(err.message||'Login failed'))}
 finally{btn.disabled=false}
});

function addReporterButton(user){
 const actions=document.querySelector('.header-actions');
 if(!actions)return;
 let b=actions.querySelector('#dashboardBtn');
 if(!b){b=document.createElement('button');b.id='dashboardBtn';b.className='reporter-btn dashboard-header-btn';b.onclick=()=>showReporterDashboard(auth.currentUser);actions.appendChild(b)}
 b.textContent='Reporter Dashboard';
 b.setAttribute('aria-label','Open Reporter Dashboard');
}
function removeDashboardButton(){$('#dashboardBtn')?.remove()}

function showReporterDashboard(user){
 if(!user){openModal('loginModal');return}
 let modal=$('#reporterDashboard');
 if(!modal){
  modal=document.createElement('div');modal.id='reporterDashboard';modal.className='modal open reporter-dashboard-modal';
  modal.innerHTML=`<div class="modal-card reporter-dashboard-card">
   <button class="close" id="dashClose" aria-label="Close">×</button>
   <div class="dashboard-head"><div><span class="eyebrow">REPORTER CENTER</span><h2>Reporter Dashboard</h2><p id="reporterIdentity" class="meta"></p></div><div class="dashboard-avatar">మ</div></div>
   <div class="dashboard-stats"><div><strong id="statTotal">0</strong><span>Total</span></div><div><strong id="statPending">0</strong><span>Under Review</span></div><div><strong id="statPublished">0</strong><span>Published</span></div><div><strong id="statRejected">0</strong><span>Rejected</span></div></div>
   <div class="dashboard-tabs"><button class="dash-tab active" data-tab="submitTab">+ Submit News</button><button class="dash-tab" data-tab="myNewsTab">My News</button><button class="dash-tab" data-tab="profileTab">Profile</button></div>
   <section id="submitTab" class="dash-panel active"><div class="panel-title"><div><span class="eyebrow">NEWSROOM</span><h3>వార్త పంపండి</h3></div><span class="status-pill">● Online</span></div>
    <form id="newsForm" class="reporter-form"><label>వార్త శీర్షిక<input id="newsTitle" required placeholder="వార్త శీర్షికను నమోదు చేయండి"></label><div class="form-two"><label>వర్గం<select id="newsCategory"><option>మహబూబాబాద్</option><option>తెలంగాణ</option><option>రాజకీయాలు</option><option>క్రైమ్</option><option>విద్య</option><option>ఉద్యోగాలు</option><option>క్రీడలు</option><option>ఈవెంట్స్</option></select></label><label>ప్రదేశం<input id="newsLocation" required placeholder="వార్త జరిగిన ప్రదేశం"></label></div><label>వార్త వివరాలు<textarea id="newsContent" required rows="8" placeholder="వార్త పూర్తి వివరాలను ఇక్కడ రాయండి..."></textarea></label><label class="upload-box"><span>📷 News image</span><input id="newsImage" type="file" accept="image/*"><small>JPG / PNG • Maximum 8 MB</small></label><div class="form-actions"><button class="reporter-btn" type="submit" id="submitNews">Submit for Approval →</button><button class="ghost-btn" type="button" id="clearNews">Clear</button></div><p id="uploadStatus" class="meta"></p></form>
   </section>
   <section id="myNewsTab" class="dash-panel"><div class="panel-title"><div><span class="eyebrow">MY STORIES</span><h3>నా వార్తలు</h3></div><button class="ghost-btn refresh-news" id="refreshNews">↻ Refresh</button></div><div id="myNewsList" class="my-news-list"><div class="empty-state">మీ వార్తలను లోడ్ చేస్తున్నాం...</div></div></section>
   <section id="profileTab" class="dash-panel"><div class="panel-title"><div><span class="eyebrow">REPORTER PROFILE</span><h3>నా ప్రొఫైల్</h3></div></div><div class="profile-card"><div class="profile-avatar">మ</div><div><strong id="profileName"></strong><p id="profileEmail"></p><span class="verified-badge">✓ Firebase verified</span></div></div><div class="location-card"><span>📍</span><div><strong>Reporter Location</strong><p id="profileLocation">Location is captured when you submit a story.</p></div></div><button class="ghost-btn" id="logoutBtn">Logout from Reporter Account</button></section>
  </div>`;
  document.body.appendChild(modal);
  $('#dashClose').onclick=()=>modal.remove();
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  $$('.dash-tab').forEach(tab=>tab.onclick=()=>switchDashboardTab(tab.dataset.tab,tab));
  $('#logoutBtn').onclick=async()=>{await auth.signOut();modal.remove();toast('Logged out successfully')};
  $('#newsForm').onsubmit=submitNews;
  $('#clearNews').onclick=()=>$('#newsForm').reset();
  $('#refreshNews').onclick=()=>loadReporterNews(user);
 }
 $('#reporterIdentity').textContent=`${user.displayName||'Reporter'} • ${user.email||''}`;
 $('#profileName').textContent=user.displayName||'Reporter';
 $('#profileEmail').textContent=user.email||'';
 loadReporterNews(user);
}

function switchDashboardTab(id,button){
 $$('.dash-tab').forEach(x=>x.classList.remove('active'));button.classList.add('active');
 $$('.dash-panel').forEach(x=>x.classList.remove('active'));$('#'+id)?.classList.add('active');
}

async function loadReporterNews(user){
 const list=$('#myNewsList');if(!list||!db)return;
 list.innerHTML='<div class="empty-state">వార్తలను లోడ్ చేస్తున్నాం...</div>';
 try{
  const snap=await db.collection('news').where('reporterUid','==',user.uid).get();
  const rows=[];snap.forEach(d=>rows.push({id:d.id,...d.data()}));
  rows.sort((a,b)=>{const aa=a.createdAt?.toMillis?a.createdAt.toMillis():0;const bb=b.createdAt?.toMillis?b.createdAt.toMillis():0;return bb-aa});
  let pending=0,published=0,rejected=0;rows.forEach(n=>{if(n.rejected||n.status==='Rejected')rejected++;else if(n.published||n.status==='Published')published++;else pending++});
  $('#statTotal').textContent=rows.length;$('#statPending').textContent=pending;$('#statPublished').textContent=published;$('#statRejected').textContent=rejected;
  if(!rows.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">📰</div><strong>ఇంకా వార్తలు లేవు</strong><p>మీ మొదటి వార్తను పంపడానికి “Submit News” ఎంచుకోండి.</p></div>';return}
  list.innerHTML=rows.map(n=>{const status=n.rejected||n.status==='Rejected'?'Rejected':(n.published||n.status==='Published'?'Published':'Under Review');const date=n.createdAt?.toDate?n.createdAt.toDate().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Recently';return `<article class="my-news-item"><div class="my-news-image">${n.imageUrl?`<img src="${n.imageUrl}" alt="">`:'NEWS'}</div><div class="my-news-body"><div class="my-news-top"><span class="tag">${n.category||'News'}</span><span class="news-status ${status.toLowerCase().replace(' ','-')}">${status}</span></div><h4>${escapeHtml(n.title||'Untitled')}</h4><p>${escapeHtml((n.content||'').slice(0,150))}${(n.content||'').length>150?'…':''}</p><div class="meta">${escapeHtml(n.location||'')} • ${date}</div></div></article>`}).join('');
 }catch(err){console.error(err);list.innerHTML='<div class="empty-state"><strong>వార్తలు లోడ్ కాలేదు</strong><p>Firestore rules లేదా connection ను చెక్ చేయండి.</p></div>'}
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function getReporterLocation(){
 return new Promise(resolve=>{
  if(!navigator.geolocation){resolve({permission:'unsupported'});return}
  navigator.geolocation.getCurrentPosition(p=>resolve({permission:'granted',latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:Math.round(p.coords.accuracy)}),e=>resolve({permission:e.code===1?'denied':'error'}),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
 });
}

async function submitNews(e){
 e.preventDefault();const user=auth?.currentUser;if(!user){toast('ముందుగా Reporter Login చేయండి');return}
 const btn=$('#submitNews'),status=$('#uploadStatus');btn.disabled=true;status.textContent='Location మరియు image processing...';
 try{
  const loc=await getReporterLocation();let imageUrl='';const file=$('#newsImage').files?.[0];
  if(file){if(file.size>8*1024*1024)throw new Error('Image must be below 8 MB');const imageRef=storage.ref(`news/${user.uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);await imageRef.put(file,{contentType:file.type});imageUrl=await imageRef.getDownloadURL()}
  await db.collection('news').add({title:$('#newsTitle').value.trim(),content:$('#newsContent').value.trim(),category:$('#newsCategory').value,location:$('#newsLocation').value.trim(),imageUrl,published:false,rejected:false,status:'UnderReview',reporterUid:user.uid,reporterEmail:user.email||'',reporterName:user.displayName||'',reporterLocation:loc,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
  e.target.reset();status.textContent=loc.permission==='granted'?'Location captured • News sent for admin approval':'Location permission not granted • News sent without coordinates';toast('వార్త Admin approval కోసం పంపబడింది');loadReporterNews(user);
 }catch(err){console.error(err);status.textContent='';toast(err.message||'News upload failed')}finally{btn.disabled=false}
}

const NOTIFY_KEY='mm-notification-choice';
function askNotificationOnFirstVisit(){
 if(!('Notification' in window)||!window.isSecureContext)return;
 if(localStorage.getItem(NOTIFY_KEY))return;
 setTimeout(()=>{
  const allow=confirm('ManaMahabubabad నుంచి Breaking News మరియు ముఖ్యమైన అప్‌డేట్స్ పొందాలా?\n\nమీ browser notification permission అడుగుతుంది. వద్దు అంటే మళ్లీ మళ్లీ అడగము.');
  if(!allow){localStorage.setItem(NOTIFY_KEY,'declined');toast('Notification preference saved');return}
  Notification.requestPermission().then(p=>{localStorage.setItem(NOTIFY_KEY,p);toast(p==='granted'?'Notifications enabled':'Notifications permission not granted')}).catch(()=>localStorage.setItem(NOTIFY_KEY,'error'));
 },1200);
}

$('#notifyBtn')?.addEventListener('click',()=>{if(!('Notification'in window)){toast('Browser notifications are not supported');return}Notification.requestPermission().then(p=>{localStorage.setItem(NOTIFY_KEY,p);toast(p==='granted'?'Notifications enabled':'Permission not granted')})});
$('#searchBtn')?.addEventListener('click',()=>{const q=prompt('ఏ వార్త వెతకాలి?');if(!q)return;let found=0;$$('.news-card,.story').forEach(c=>{const ok=c.innerText.toLowerCase().includes(q.toLowerCase());c.style.display=ok?'':'none';if(ok)found++});toast(found+' వార్తలు కనిపించాయి')});
let currentTitle='మహబూబాబాద్ జిల్లా ప్రజలకు తాజా స్థానిక సమాచారం';
function drawShare(title){const c=$('#shareCanvas'),x=c.getContext('2d');x.fillStyle='#f8f5ec';x.fillRect(0,0,c.width,c.height);x.fillStyle='#161616';x.fillRect(0,0,c.width,105);x.fillStyle='#fff';x.font='800 30px Arial';x.fillText('MANA MAHABUBABAD',55,67);x.fillStyle='#b91c1c';x.fillRect(55,145,130,8);x.fillStyle='#161616';x.font='800 64px Georgia';wrap(x,title,55,245,970,78,4);x.fillStyle='#aaa';x.fillRect(55,600,970,330);x.fillStyle='#888';x.font='800 28px Arial';x.fillText('NEWS IMAGE',410,775);x.fillStyle='#222';x.font='400 31px Arial';wrap(x,'మహబూబాబాద్ జిల్లాలోని తాజా సమాచారం, ప్రజలకు సంబంధించిన ముఖ్యమైన అంశాలు మరియు స్థానిక పరిణామాలను మన మహబూబాబాద్ మీ ముందుకు తీసుకువస్తోంది.',55,1000,970,45,5);x.fillStyle='#777';x.font='24px Arial';x.fillText('ManaMahabubabad • Today',55,1265);x.fillText(location.href,55,1305)}
function wrap(x,text,px,py,max,lh,maxLines){const words=text.split(' ');let line='',n=0;for(const w of words){const test=line+w+' ';if(x.measureText(test).width>max&&line){x.fillText(line,px,py);py+=lh;line=w+' ';if(++n>=maxLines)break}else line=test}if(n<maxLines)x.fillText(line,px,py)}
$$('[data-share]').forEach(b=>b.onclick=()=>{currentTitle=$('#modalTitle')?.textContent||'మహబూబాబాద్ జిల్లా తాజా సమాచారం';drawShare(currentTitle);openModal('shareModal')});
$('#downloadShare')?.addEventListener('click',()=>{const a=document.createElement('a');a.download='ManaMahabubabad-News.png';a.href=$('#shareCanvas').toDataURL('image/png');a.click();toast('Newspaper image downloaded')});
$('#copyLink')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('News link copied')}catch{toast('Copy failed')}});
$('#nativeShare')?.addEventListener('click',async()=>{const c=$('#shareCanvas');c.toBlob(async blob=>{const file=new File([blob],'ManaMahabubabad-News.png',{type:'image/png'});if(navigator.share){try{await navigator.share({title:currentTitle,text:'ManaMahabubabad News',files:[file]})}catch(e){} }else{try{await navigator.clipboard.writeText(location.href);toast('Link copied — share it on WhatsApp')}catch{}}},'image/png')});

initFirebase().then(askNotificationOnFirstVisit);
