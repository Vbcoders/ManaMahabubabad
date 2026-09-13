/* ManaMahabubabad UI fixes — mobile, theme, share preview and basic content protection */
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    /* app.js already owns the theme button. Do not attach a second toggle handler. */
    const theme=document.querySelector('#themeBtn');
    if(theme) theme.dataset.fixed='1';

    /* Prevent duplicate share handlers while keeping article sharing working. */
    document.querySelectorAll('[data-share]').forEach(btn=>{
      if(btn.dataset.shareFixed)return;
      btn.dataset.shareFixed='1';
      btn.addEventListener('click',()=>{
        const modal=document.querySelector('#articleModal');
        const title=document.querySelector('#modalTitle')?.textContent||'ManaMahabubabad News';
        const body=document.querySelector('#modalBody');
        const img=body?.querySelector('img')?.src||'';
        if(typeof drawShare==='function')drawShare({title,content:body?.innerText||'',imageUrl:img});
        if(typeof openModal==='function')openModal('shareModal');
      });
    });

    document.querySelector('#reporterBtn')?.addEventListener('click',()=>{
      if(typeof auth!=='undefined'&&auth?.currentUser&&typeof showReporterDashboard==='function')showReporterDashboard(auth.currentUser);
      else document.querySelector('#loginModal')?.classList.add('open');
    });
    document.querySelector('#reporterBtn2')?.addEventListener('click',()=>{
      if(typeof auth!=='undefined'&&auth?.currentUser&&typeof showReporterDashboard==='function')showReporterDashboard(auth.currentUser);
      else document.querySelector('#loginModal')?.classList.add('open');
    });

    /* Keep the share preview large enough on phones while preserving the image design. */
    const style=document.createElement('style');
    style.id='mm-mobile-fixes';
    style.textContent=`
      .share-card{width:min(760px,96vw)!important;max-width:96vw!important}
      .share-card canvas{width:100%!important;max-width:100%!important;height:auto!important;max-height:72vh!important;object-fit:contain!important}
      .share-actions{flex-wrap:wrap}
      @media(max-width:760px){
        html,body{width:100%;max-width:100%;overflow-x:hidden}
        .container{width:94%!important;max-width:94%!important}
        .top-inner{height:30px;gap:8px;font-size:9px;overflow:hidden}
        .top-location{display:none}
        .masthead{min-height:76px!important;padding:9px 0;gap:8px;align-items:center;flex-wrap:wrap}
        .mobile-menu{display:grid!important;order:0;width:38px;height:38px;padding:0;place-items:center;flex:0 0 38px}
        .brand{order:1;min-width:0;flex:1;gap:7px}
        .brand-mark{width:39px;height:39px;font-size:22px;flex:0 0 39px}
        .brand h1{font-size:21px!important;white-space:nowrap}
        .brand p{font-size:8px!important;letter-spacing:.4px;margin-top:4px!important;white-space:nowrap}
        .header-actions{order:2;width:100%;display:flex!important;justify-content:flex-end;gap:6px;min-width:0}
        .header-actions .ghost-btn,.header-actions .reporter-btn{font-size:10px!important;padding:8px 9px!important;min-width:0;white-space:nowrap;flex:1 1 auto}
        .header-actions .ghost-btn{flex:0 0 42px}
        .header-actions .reporter-btn{max-width:none}
        .nav{position:relative}
        .nav-inner{display:none!important;flex-direction:column;align-items:stretch;max-height:65vh;overflow:auto}
        .nav-inner.open{display:flex!important}
        .nav a{padding:11px 14px;font-size:12px;border-bottom:1px solid var(--line)}
        .breaking-inner{min-height:34px}
        .breaking strong{font-size:9px;padding:6px 8px}
        .ticker{font-size:9px}
        .hero-grid,.news-layout,.category-band,.three-columns,.footer-grid{grid-template-columns:1fr!important}
        .hero-grid{padding:16px 0!important;gap:12px}
        .hero-image{height:230px!important}
        .lead-body{padding:15px!important}
        .lead-body h2{font-size:25px!important}
        .mini-card{grid-template-columns:90px 1fr!important;gap:10px;padding:9px!important}
        .mini-image{min-height:90px!important}
        .mini-card h3{font-size:16px!important}
        .section-head{padding:24px 0 13px!important;gap:10px;align-items:center}
        .section-head h2,.category-band h2{font-size:25px!important}
        .news-layout{gap:14px!important}
        .story{grid-template-columns:100px 1fr!important;gap:11px!important;padding:9px!important}
        .story-image{min-height:100px!important}
        .story-content h3{font-size:17px!important}
        .story-content p{font-size:12px!important}
        .category-band{margin:24px 0!important;padding:20px!important;gap:15px!important}
        .join-reporter{padding:20px!important;display:block!important}
        .join-reporter .reporter-btn{width:100%;margin-top:10px}
        .modal{padding:8px!important}
        .modal-card{width:100%!important;max-width:100%!important;padding:18px!important;border-radius:14px!important;max-height:94vh!important}
        .login-card{width:100%!important}
        .share-card{width:96vw!important;max-width:96vw!important;padding:10px!important}
        .share-card canvas{width:100%!important;max-height:68vh!important;margin:8px 0!important}
        .share-actions{gap:6px!important}
        .share-actions button{font-size:11px!important;padding:8px 9px!important;flex:1 1 30%}
        .reporter-dashboard-modal{padding:5px!important}
        .reporter-dashboard-card{width:100%!important;max-width:100%!important;padding:15px!important;max-height:96vh!important}
        .dashboard-head{padding-right:22px!important}
        .dashboard-head h2{font-size:24px!important}
        .dashboard-stats{grid-template-columns:repeat(2,1fr)!important;gap:7px!important;margin:14px 0!important}
        .dashboard-stats>div{padding:10px!important}
        .dashboard-stats strong{font-size:20px!important}
        .dashboard-tabs{overflow-x:auto!important}
        .dash-tab{font-size:11px!important;padding:10px 9px!important}
        .form-two{grid-template-columns:1fr!important}
        .form-actions{flex-direction:column!important;align-items:stretch!important}
        .form-actions button{width:100%!important}
        .my-news-item{grid-template-columns:75px 1fr!important;gap:9px!important}
        .my-news-image{height:75px!important}
        .profile-card{gap:10px!important}
        footer .copyright span{float:none!important;display:block;margin-top:6px}
      }
      @media(min-width:761px){.mobile-menu{display:none!important}}
    `;
    document.head.appendChild(style);

    /* Disable browser pinch/gesture zoom and common zoom shortcuts for this site. */
    const vp=document.querySelector('meta[name="viewport"]');
    if(vp) vp.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

    /* Best-effort copy/content protection. OS/browser screenshots cannot be reliably blocked by a website. */
    document.addEventListener('contextmenu',e=>e.preventDefault(),{passive:false});
    document.addEventListener('selectstart',e=>{
      if(!e.target.matches('input,textarea,[contenteditable="true"]')) e.preventDefault();
    },{passive:false});
    document.addEventListener('dragstart',e=>e.preventDefault(),{passive:false});
    document.addEventListener('copy',e=>{
      if(!e.target.matches('input,textarea,[contenteditable="true"]')) e.preventDefault();
    },{passive:false});
    document.addEventListener('cut',e=>{
      if(!e.target.matches('input,textarea,[contenteditable="true"]')) e.preventDefault();
    },{passive:false});
    document.addEventListener('keydown',e=>{
      const k=e.key.toLowerCase();
      if((e.ctrlKey||e.metaKey)&&['c','x','u','s','p','a','+','-','=','0'].includes(k)){
        if(e.target.matches('input,textarea,[contenteditable="true"]')&&!['u','s','p'].includes(k)) return;
        e.preventDefault();
      }
      if(e.key==='PrintScreen'){
        document.body.classList.add('mm-capture-block');
        setTimeout(()=>document.body.classList.remove('mm-capture-block'),1200);
      }
    },{passive:false});
    document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});
    document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
    document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
    document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
  },50);
});
