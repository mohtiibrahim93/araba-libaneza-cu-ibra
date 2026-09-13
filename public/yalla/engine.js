(function(root){
  'use strict';
  const exact = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const norm = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/kh/g,'5').replace(/gh/g,'8').replace(/([aeiou])\1+/g,'$1').replace(/[^a-z0-9]/g,'');
  const shuffle = (a,rng=Math.random) => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
  const forms = c => [c.ar,...(c.variants||[])].map(norm);
  // Only typography and explicit alternatives are accepted, never edit-distance guesses.
  const spelling=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/kh/g,'5').replace(/gh/g,'8').replace(/[’‘']/g,'').replace(/-/g,'').replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,' ');
  const accepts=(c,text)=>[c.ar,...(c.variants||[])].some(v=>spelling(v)===spelling(text));
  function feedback(c,text){
    if(accepts(c,text))return spelling(c.ar)!==spelling(text)?'Variantă acceptată. Sensul și forma cerută sunt păstrate.':'Corect: '+c.ar+' — '+c.ro;
    const a=spelling(c.ar).split(' '),b=spelling(text).split(' ');
    if(a.length===b.length&&a.some((w,i)=>w!==b[i]&&w.slice(0,-2)===b[i]?.slice(0,-2)&&w.length>3))return 'Verifică terminația: persoana, genul sau timpul cerut pot schimba răspunsul. Model: '+c.ar;
    return 'Compară răspunsul tău cu „'+c.ar+'”. Sunt acceptate grafiile și alternativele înregistrate pentru această expresie; o formă apropiată nu este validată automat.';
  }
  const DAY=86400000,intervals=[1,3,7,14,30];
  const dueAt=p=>Number.isFinite(p?.dueAt)?p.dueAt:p?.last&&p?.seen?p.last+DAY:null;
  const isDue=(p,now=Date.now())=>dueAt(p)!==null&&dueAt(p)<=now;
  const due=(items,progress,now=Date.now())=>items.filter(c=>isDue(progress[c.id],now)).sort((a,b)=>dueAt(progress[a.id])-dueAt(progress[b.id]));
  const unique = (items,key) => {const seen=new Set();return items.filter(x=>{const k=key(x);if(seen.has(k))return false;seen.add(k);return true;});};
  function pick(items,progress,count=10){
    return shuffle(items).map(x=>({x,p:(progress[x.id]?.wrong?0:!progress[x.id]?.seen?1:(progress[x.id]?.streak||0)<3?2:3)})).sort((a,b)=>a.p-b.p).slice(0,count).map(x=>x.x);
  }
  // Fresh rounds rotate through the bank; mistakes are selected only in explicit review.
  const roundKey=c=>c.ar?"ar:"+norm(c.ar):c.answer?.split(/\s+/).length>=3?"ar:"+norm(c.answer):"drill:"+exact(c.prompt);
  function round(primary, fallback, progress, previous=[], count=20, review=false){
    const old=new Set(previous), candidates=unique([...primary,...fallback],roundKey), main=new Set(primary.map(c=>c.id));
    const rank=c=>review?(main.has(c.id)?0:1):((old.has(c.id)||old.has(roundKey(c)))?2:main.has(c.id)?0:1);
    return shuffle(candidates).sort((a,b)=>rank(a)-rank(b)||(review?0:(progress[a.id]?.seen||0)-(progress[b.id]?.seen||0))).slice(0,count);
  }
  function options(card,pool,reverse=false){
    const key=reverse?'ro':'ar', answer=card[key], targetForms=forms(card);
    const safe=pool.filter(c=>c.id!==card.id && c.lang===card.lang && norm(c.ro)!==norm(card.ro) && !forms(c).some(f=>targetForms.includes(f)));
    const local=shuffle(safe.filter(c=>c.unit===card.unit));
    const other=shuffle(safe.filter(c=>c.unit!==card.unit));
    const wrong=unique([...local,...other],c=>norm(c[key])).slice(0,3).map(c=>c[key]);
    return shuffle([answer,...wrong]);
  }
  function makeQuestion(card,pool,mode='mix',index=0){
    const tokens=card.ar.trim().split(/\s+/);
    const canOrder=tokens.length>=3 && tokens.length<=12;
    let type=mode==='write'?'write':mode==='cards'?'learn':mode==='order'?(canOrder?'order':'write'):mode==='mix'?(canOrder && index%3===2?'order':index%2===0?'choice':'reverse'):'choice';
    const q={id:card.id,type,card,answer:card.ar};
    if(type==='choice'||type==='reverse')q.options=options(card,pool,type==='reverse');
    if(type==='reverse')q.answer=card.ro;
    if(type==='order'){
      q.tokens=shuffle(tokens.map((text,id)=>({text,id})));
      if(q.tokens.every((t,i)=>t.id===i))q.tokens.push(q.tokens.shift());
    }
    return q;
  }
  function record(progress,id,correct,hinted=false,now=Date.now()){
    const old=progress[id]||{seen:0,correct:0,streak:0,wrong:false},earned=correct&&!hinted;
    const advance=earned&&(dueAt(old)===null||isDue(old,now));
    const stage=earned?(advance?Math.min(intervals.length-1,(old.reviewStage??-1)+1):(old.reviewStage??0)):0;
    const nextDue=!earned?now+DAY:advance?now+intervals[stage]*DAY:dueAt(old);
    return {...progress,[id]:{...old,seen:old.seen+1,correct:old.correct+(earned?1:0),streak:earned?Math.min(3,(old.streak||0)+1):0,wrong:!earned,last:now,reviewStage:stage,dueAt:nextDue}};
  }
  function mixed(items,pool){
    const available=[...items],out=[],used=new Set();
    const take=(type,test)=>{const c=available.find(c=>!used.has(roundKey(c))&&test(c));if(!c)return false;used.add(roundKey(c));
      if(c.prompt)out.push({id:c.id,type:'drill',drill:c,answer:c.answer,options:shuffle([c.answer,...c.wrong])});
      else {const q=makeQuestion(c,pool,type==='order'?'order':type==='write'?'write':'mix',type==='reverse'?1:0);out.push(q);}return true;};
    for(let i=0;i<4;i++){
      take('choice',c=>!!c.ar);take('reverse',c=>!!c.ar);take('write',c=>!!c.ar);
      take('order',c=>!!c.ar&&c.ar.split(/\s+/).length>=3&&c.ar.split(/\s+/).length<=12);
      take('drill',c=>!!c.prompt&&!!c.dialog===(i%2===1));
    }
    while(out.length<20){if(!take(out.length%2?'write':'choice',()=>true))break;}
    return out.slice(0,20);
  }
  const api={exact,norm,spelling,feedback,dueAt,isDue,due,DAY,mixed,shuffle,forms,accepts,unique,pick,roundKey,round,options,makeQuestion,record};
  // Reuse only spelling alternatives already present for the same source meaning.
  if(root.YALLA){const groups=new Map();for(const c of root.YALLA.cards){const k=norm(c.ar)+'|'+exact(c.ro);if(!groups.has(k))groups.set(k,new Set());for(const v of [c.ar,...(c.variants||[])])groups.get(k).add(v);}for(const c of root.YALLA.cards){const known=groups.get(norm(c.ar)+'|'+exact(c.ro));c.variants=[...new Set([...(c.variants||[]),...known])].filter(v=>v!==c.ar);}}
  root.YallaEngine=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
