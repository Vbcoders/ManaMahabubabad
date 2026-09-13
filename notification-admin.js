/* ManaMahabubabad — admin push composer */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const imageOf=n=>n?.imageData||n?.imageUrl||'';
  let current=null;

  function addButtons(){
    document.querySelectorAll('#newsList .news-item').forEach(item=>{
      const status=item.querySelector('.status.published');
      if(!status||item.querySelector('[data-push-news]'))return;
      const id=item.querySelector('[data-action]')?.dataset?.id;
      if(!id)return;
      const b=document.createElement('button');
      b.className='push-news';b.dataset.pushNews=id;b.textContent='🔔 Push Notification';
      item.querySelector('.actions')?.appendChild(b);
    });
  }

  async function openComposer(id){
    if(!window.db){alert('Admin Firebase is still loading.');return}
    try{
      const snap=await db.collection('news').doc(id).get();
      if(!snap.exists){alert('News not found.');return}
      current={id,snap,...snap.data()};
      let modal=document.querySelector('#pushComposer');
      if(!modal){
        modal=document.createElement('div');modal.id='pushComposer';modal.className='push-overlay';
        modal.innerHTML=`<div class="push-modal card"><button class="push-close" type="button">×</button><div class="push-kicker">BREAKING NEWS ALERT</div><h2>Push News Notification</h2><p class="meta">Select a published story, edit the notification heading, preview the news image and send it to subscribed readers.</p><label>Notification Heading<input id="pushHeading" maxlength="120"></label><label>Notification Message<textarea id="pushBody" rows="3" maxlength="180"></textarea></label><div class="push-preview"><div class="push-preview-image" id="pushImagePreview">NEWS</div><div><span class="tag">ManaMahabubabad</span><h3 id="pushPreviewTitle"></h3><p id="pushPreviewBody"></p></div></div><div class="push-meta" id="pushNewsMeta"></div><div class="push-actions"><button class="btn ghost" id="pushCancel" type="button">Cancel</button><button class="btn push-send" id="pushSend" type="button">🔔 Send Notification</button></div><div id="pushStatus" class="message"></div></div>`;
        document.body.appendChild(modal);
        modal.querySelector('.push-close').onclick=()=>modal.remove();
        modal.querySelector('#pushCancel').onclick=()=>modal.remove();
        modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
        modal.querySelector('#pushHeading').addEventListener('input',syncPreview);
        modal.querySelector('#pushBody').addEventListener('input',syncPreview);
        modal.querySelector('#pushSend').onclick=send;
      }
      modal.style.display='grid';
      const heading=modal.querySelector('#pushHeading'),body=modal.querySelector('#pushBody');
      heading.value=current.title||'';
      body.value=(current.content||'').replace(/\s+/g,' ').trim().slice(0,150)||'కొత్త వార్త వచ్చింది. పూర్తి వార్త చదవడానికి ట్యాప్ చేయండి.';
      const image=imageOf(current),preview=modal.querySelector('#pushImagePreview');
      preview.innerHTML=image?`<img src="${esc(image)}" alt="News image">`:'<span>NEWS</span>';
      modal.querySelector('#pushNewsMeta').textContent=(current.category||'News')+' • '+(current.location||'మహబూబాబాద్');
      syncPreview();
    }catch(e){console.error(e);alert('Could not open notification composer: '+(e.message||'Firestore error'))}
  }

  function syncPreview(){
    const m=document.querySelector('#pushComposer');if(!m)return;
    m.querySelector('#pushPreviewTitle').textContent=m.querySelector('#pushHeading').value;
    m.querySelector('#pushPreviewBody').textContent=m.querySelector('#pushBody').value;
  }

  async function send(){
    const m=document.querySelector('#pushComposer');if(!m||!current)return;
    const button=m.querySelector('#pushSend'),status=m.querySelector('#pushStatus');
    const title=m.querySelector('#pushHeading').value.trim(),body=m.querySelector('#pushBody').value.trim();
    if(!title){status.className='message bad';status.textContent='Notification heading is required.';return}
    button.disabled=true;button.textContent='Sending…';status.className='message good';status.textContent='Creating notification…';
    try{
      const siteUrl=new URL('./',location.href).href;
      await db.collection('pushNotifications').add({newsId:current.id,title,body,imageUrl:current.imageUrl||'',url:siteUrl+'?news='+encodeURIComponent(current.id),createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdBy:auth.currentUser.email,status:'Queued'});
      status.textContent='Notification queued. It will be delivered to subscribed readers.';
      button.textContent='✓ Sent';
      setTimeout(()=>m.remove(),1200);
    }catch(e){console.error(e);status.className='message bad';status.textContent='Send failed: '+(e.message||'Permission denied.');button.disabled=false;button.textContent='🔔 Send Notification'}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const list=document.querySelector('#newsList');
    if(list){new MutationObserver(addButtons).observe(list,{childList:true,subtree:true});setTimeout(addButtons,700)}
    document.addEventListener('click',e=>{const b=e.target.closest('[data-push-news]');if(b)openComposer(b.dataset.pushNews)});
  });
})();
