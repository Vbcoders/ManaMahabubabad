/* ManaMahabubabad — enhanced newspaper share card */
(function(){
  const BRAND_RED = '#d71920';
  const PAPER = '#fffdf8';
  const INK = '#171717';

  window.drawShare = function(n){
    const c = document.getElementById('shareCanvas');
    if(!c) return;

    /* High-resolution social/news share image */
    c.width = 1400;
    c.height = 1800;

    const x = c.getContext('2d');
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high';

    x.fillStyle = PAPER;
    x.fillRect(0,0,c.width,c.height);

    /* Header */
    x.fillStyle = INK;
    x.fillRect(0,0,c.width,190);
    x.fillStyle = '#ffffff';
    x.font = '800 66px Arial, sans-serif';
    x.fillText('Mana',70,118);
    x.fillStyle = BRAND_RED;
    x.fillText('Mahabubabad',265,118);

    x.fillStyle = '#ffffff';
    x.font = '500 25px Arial, sans-serif';
    x.fillText('మన మహబూబాబాద్ • ప్రజల గొంతుక',72,160);

    /* Red newspaper divider */
    x.fillStyle = BRAND_RED;
    x.fillRect(70,220,1260,8);
    x.fillStyle = '#555';
    x.font = '700 24px Arial, sans-serif';
    x.fillText('LOCAL NEWS • MAHABUBABAD • TELANGANA',70,270);

    /* Headline */
    x.fillStyle = INK;
    x.font = '800 66px Arial, "Noto Sans Telugu", sans-serif';
    wrapShare(x,n?.title||'మహబూబాబాద్ తాజా వార్తలు',70,365,1260,82,5);

    const img = n?.imageData || n?.imageUrl || '';
    const imageTop = 760;
    const imageHeight = 560;

    const finish = function(){
      x.fillStyle = '#242424';
      x.font = '400 31px Arial, "Noto Sans Telugu", sans-serif';
      wrapShare(x,n?.content||'మహబూబాబాద్ తాజా స్థానిక వార్తలు',70,1390,1260,48,5);

      /* Footer URL */
      x.fillStyle = '#eeeeee';
      x.fillRect(55,1660,1290,92);
      x.fillStyle = INK;
      x.font = '700 24px Arial, sans-serif';
      x.fillText('READ MORE:',75,1697);
      x.fillStyle = BRAND_RED;
      x.font = '600 23px Arial, sans-serif';
      const url = (location.origin + location.pathname).replace(/\/$/,'');
      x.fillText(url,245,1697);
      x.fillStyle = '#777';
      x.font = '20px Arial, sans-serif';
      x.fillText('© ManaMahabubabad • '+new Date().toLocaleDateString('en-IN'),75,1732);
    };

    if(img){
      const im = new Image();
      im.onload = function(){
        const iw=im.naturalWidth||im.width, ih=im.naturalHeight||im.height;
        const scale=Math.max(1260/iw,imageHeight/ih);
        const dw=iw*scale, dh=ih*scale;
        const dx=70+(1260-dw)/2, dy=imageTop+(imageHeight-dh)/2;
        x.save();
        x.beginPath();
        x.rect(70,imageTop,1260,imageHeight);
        x.clip();
        x.drawImage(im,dx,dy,dw,dh);
        x.restore();
        x.fillStyle='rgba(0,0,0,.08)';
        x.fillRect(70,imageTop,1260,6);
        finish();
      };
      im.onerror=finish;
      im.src=img;
    }else{
      x.fillStyle='#eeeeee';
      x.fillRect(70,imageTop,1260,imageHeight);
      x.fillStyle='#999';
      x.font='800 48px Arial, sans-serif';
      x.fillText('MANAMAHABUBABAD',390,imageTop+285);
      finish();
    }
  };

  function wrapShare(x,text,px,py,maxWidth,lineHeight,maxLines){
    const words=String(text||'').split(/\s+/), lines=[];
    let line='';
    for(const word of words){
      const test=line ? line+' '+word : word;
      if(x.measureText(test).width>maxWidth && line){
        lines.push(line); line=word;
        if(lines.length>=maxLines) break;
      }else line=test;
    }
    if(line && lines.length<maxLines) lines.push(line);
    lines.forEach((v,i)=>x.fillText(v,px,py+i*lineHeight));
  }
})();
