const admin=require('firebase-admin');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {setGlobalOptions}=require('firebase-functions/v2');

admin.initializeApp();
setGlobalOptions({region:'asia-south1',maxInstances:2});

exports.sendNewsPush=onDocumentCreated('pushNotifications/{notificationId}',async event=>{
  const snap=event.data;
  if(!snap)return;
  const n=snap.data()||{};
  if(n.status&&n.status!=='Queued')return;

  const tokensSnap=await admin.firestore().collection('notificationTokens').get();
  const tokens=[];
  tokensSnap.forEach(d=>{const t=d.data()?.token;if(typeof t==='string'&&t.length>10)tokens.push({id:d.id,token:t})});

  if(!tokens.length){await snap.ref.update({status:'No subscribers',sentAt:admin.firestore.FieldValue.serverTimestamp(),sentCount:0});return}

  const url=String(n.url||'https://vbcoders.github.io/ManaMahabubabad/');
  const baseData={title:String(n.title||'ManaMahabubabad'),body:String(n.body||'కొత్త వార్త వచ్చింది.'),newsId:String(n.newsId||''),notificationId:event.params.notificationId,url};
  let sent=0,failed=0;

  for(let i=0;i<tokens.length;i+=500){
    const batch=tokens.slice(i,i+500);
    const response=await admin.messaging().sendEachForMulticast({tokens:batch.map(x=>x.token),data:baseData,webpush:{fcmOptions:{link:url}}});
    sent+=response.successCount;failed+=response.failureCount;
    const removals=[];
    response.responses.forEach((r,index)=>{
      const code=r.error?.code||'';
      if(code.includes('registration-token-not-registered')||code.includes('invalid-registration-token'))removals.push(batch[index].id);
    });
    await Promise.all(removals.map(id=>admin.firestore().collection('notificationTokens').doc(id).delete()));
  }

  await snap.ref.update({status:'Sent',sentAt:admin.firestore.FieldValue.serverTimestamp(),sentCount:sent,failedCount:failed});
});
