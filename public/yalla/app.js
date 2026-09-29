(() => {
 'use strict';
 const D=window.YALLA,E=window.YallaEngine;
 const $=s=>document.querySelector(s);
 /* Interface language: see public/yalla/i18n.js. T keeps the Romanian in
    place as the key, so an unconverted string stays Romanian instead of
    rendering blank. Card meanings are not switched here. */
 const T=(ro,en)=>window.YallaI18n?window.YallaI18n.t(ro,en):ro;
 // 'Vocabular' is a group id as well as a label: the level picker matches
 // learningTrack against it, so the value stays Romanian and only the
 // rendering is translated.
 const gl=g=>g==='Vocabular'?T('Vocabular','Vocabulary'):g;
 const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key='yalla-liban-progress-v1';
 let saveFailed=false;
 const empty=()=>({xp:0,rounds:0,progress:{},daily:{},badges:[],lastUnit:'l1'});
 let state=empty();
 try{const s=JSON.parse(localStorage.getItem(key));if(s&&typeof s.xp==='number'&&s.progress&&typeof s.progress==='object')state={...empty(),...s};}catch{}
 window.YallaCurriculum.migrate(state);
 /* Inline correcting.
    The teacher workspace could already fix a card, but only by searching a
    list of 4,315 and filling a form — which is not how anyone notices a
    mistake. You notice it while reading the word, or the moment a round marks
    you wrong. These two entry points put the fix where the mistake is.

    Gated on YALLA_TEACHER, which the page sets on this frame only when an
    owner is signed in, so learners never see an edit control. The real
    boundary is server-side: publishing goes through the admin function, and
    an unsigned visitor editing here only ever changes their own browser. */
 const canEdit=()=>window.YALLA_TEACHER===true;
 let editingCard=null;
 function startEdit(id){editingCard=id;render();}
 function cancelEdit(){editingCard=null;render();}
 function saveEdit(id,ar,ro,variants){
  const A=window.YallaAcademy;if(!A||typeof A.commitEdits!=='function')return;
  try{
   // YallaAcademy exposes no reader for the current edits, so take them from
   // the key it writes. commitEdits replaces the whole map, so the existing
   // ones have to be carried across or this card's fix would wipe the rest.
   let current={};
   try{current=JSON.parse(localStorage.getItem('yalla-teacher-edits-v1')||'{}')||{};}catch{}
   A.commitEdits({...current,[id]:{ar,ro,variants}});
   editingCard=null;toast('Corectat. Apasa „Publica corecturile" ca sa ajunga la cursanti.');render();
  }catch(e){toast(String((e&&e.message)||T('Nu s-a putut salva.','Could not save.')));}
 }
 function editForm(c){
  return `<form class="inline-edit" data-edit-form="${c.id}"><label>Arabizi<input name="ar" dir="ltr" required maxlength="500" value="${h(c.ar)}"></label><label>Sens<input name="ro" required maxlength="1000" value="${h(c.ro)}"></label><label>${T('Variante acceptate — separate prin virgulă','Accepted variants — comma separated')}<input name="variants" value="${h((c.variants||[]).join(', '))}"></label><div class="inline-edit-actions"><button class="btn primary" type="submit">${T('Salvează','Save')}</button><button class="btn secondary" type="button" data-cancel-edit>${T('Renunță','Cancel')}</button></div></form>`;
 }
 let view='journey',group='A1',trainingLevel='A1',session=null,chosenUnit='l1',mode='mix',lexPage=0,lexQuery='',lexUnit='all',toastTimer;
 const icons={
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2V11.5A8.5 8.5 0 0 1 9.5 3h3A8.5 8.5 0 0 1 21 11.5Z"/><path d="M7 9h8M7 13h5"/>',
  home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  star:'<path d="m12 2 3 6.5 7 .9-5 5 .9 7L12 18l-5.9 3.4.9-7-5-5 7-.9Z"/>',
  spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  flag:'<path d="M4 22V3m0 1c5-4 10 4 16 0v10c-6 4-11-4-16 0"/>',
  book:'<path d="M12 5c-4-3-8-2-10-1v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v15"/>',
  cup:'<path d="M4 8h13v7a6.5 6.5 0 0 1-13 0Zm13 0h2a3 3 0 0 1 0 6h-2M3 22h15M7 2v3m5-3v3"/>',
  drop:'<path d="M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13Z"/>',
  tag:'<path d="M3 3h8l10 10-8 8L3 11Z"/><circle cx="7.5" cy="7.5" r="1"/>',
  paw:'<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4" cy="8" rx="2" ry="3"/><ellipse cx="10" cy="4" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="21" cy="10" rx="2" ry="3"/>',
  leaf:'<path d="M20 3C4 0 0 13 7 19 15 25 23 13 20 3ZM4 22 16 8"/>',
  wave:'<path d="M2 8c4-6 6 6 10 0s6 6 10 0M2 14c4-6 6 6 10 0s6 6 10 0M2 20c4-6 6 6 10 0s6 6 10 0"/>',
  palette:'<circle cx="8" cy="8" r=".8"/><circle cx="13" cy="6" r=".8"/><circle cx="17" cy="10" r=".8"/><path d="M12 22a10 10 0 1 1 10-10c0 4-4 1-6 3s2 7-4 7Z"/>',
  music:'<path d="M9 18V5l12-3v14M9 9l12-3"/><ellipse cx="6" cy="19" rx="3" ry="2"/><ellipse cx="18" cy="17" rx="3" ry="2"/>',
  gift:'<path d="M3 10h18v11H3ZM1 6h22v4H1ZM12 6v15"/><path d="M12 6C1 6 7-4 12 6c5-10 11 0 0 0Z"/>',
  pen:'<path d="m3 17-1 5 5-1L21 7l-6-6ZM12 4l6 6"/>',
  anchor:'<circle cx="12" cy="4" r="2"/><path d="M12 6v15M6 10h12M2 14v3a10 10 0 0 0 20 0v-3M2 14l3 3m17-3-3 3"/>',
  map:'<path d="m2 5 6-3 8 3 6-3v17l-6 3-8-3-6 3Zm6-3v17m8-14v17"/>',
  bag:'<rect x="3" y="7" width="18" height="15" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="m5 5 14 14M5 19 19 5"/>',
  refresh:'<path d="M20 8a9 9 0 1 0 1 8M20 2v6h-6"/>',
  bolt:'<path d="m14 2-11 12h8l-1 8 11-12h-8Z"/>',
  layers:'<path d="m12 2 10 6-10 6L2 8Zm-10 10 10 6 10-6M2 17l10 6 10-6"/>',
  trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  download:'<path d="M12 2v13m-5-5 5 5 5-5M3 15v6h18v-6"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-11v1"/>',
  keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M5 9h1m3 0h1m3 0h1m3 0h1M5 13h1m3 0h1m3 0h1m3 0h1M7 16h10"/>',
  volume:'<path d="m11 3-6 5H1v8h4l6 5Zm4 4a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>'
 };
 const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.star}</svg>`;
 const day=()=>new Date().toLocaleDateString('en-CA');
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));saveFailed=false;}catch{saveFailed=true;}};
 const allItems=[...D.cards,...D.drills];
 /* synthesis.js appends ~845 generated cards at runtime, built from the source
    material rather than from the reviewed CSV, so they carry no level. The
    ceiling filter below only keeps a card whose level it recognises, so without
    this they would vanish from every training pool — the old pool included them,
    because it filtered by their lesson's group. Each inherits the level of the
    first levelled card in its own lesson, falling back to the lesson's group
    when that names a level (A1/A2/B1), and to the highest level otherwise. */
 (function levelTheSynthesised(){
  const known=new Set((D.levels||[]).map(l=>l.id)),top=(D.levels||[]).map(l=>l.id).pop();
  const byUnit={};
  for(const c of D.cards) if(c.level&&!byUnit[c.unit]) byUnit[c.unit]=c.level;
  for(const c of D.cards){
   if(c.level) continue;
   const u=D.units.find(x=>x.id===c.unit);
   c.level=byUnit[c.unit]||(u&&known.has(u.group)?u.group:top);
  }
 })();

 const unitItems=id=>allItems.filter(c=>c.unit===id);
 const learned=id=>unitItems(id).filter(c=>(state.progress[c.id]?.streak||0)>=3).length;
 const reviewed=()=>allItems.filter(c=>state.progress[c.id]?.wrong);
 const practiced=()=>Object.values(state.progress).filter(x=>x.seen>0).length;
 const mastered=()=>Object.values(state.progress).filter(x=>x.streak>=3).length;
 const progressBar=(v,max,cls='')=>`<div class="progress-track ${cls}" role="progressbar" aria-label="Progres" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${Math.min(100,Math.max(0,v/Math.max(1,max)*100))}%"></span></div>`;
 const originalSourceLine=item=>`${D.sources.find(s=>s.id===item.source)?.title||''}${item.page?' · p. '+item.page:''}`;
 const sourceLine=item=>D.units.find(u=>u.id===item?.unit)?.title||'';
 function toast(message){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t);}t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
 function shell(content){
  const xpLevel=Math.floor(state.xp/200)+1;
  $('#app').innerHTML=`<aside class="sidebar">
   <button class="brand" data-nav="journey" aria-label="Yalla, traseul meu"><span class="brand-mark">Y<span>!</span></span><span>yalla<span class="brand-dot">!</span><small>${T('AVENTURA LIBANEZĂ','THE LEBANESE ADVENTURE')}</small></span></button>
   <div class="course-label"><span class="mini-pill">Arabizi</span> ${T('Arabă libaneză','Lebanese Arabic')}</div>
   <nav aria-label="${T('Navigare principală','Main navigation')}">
    ${[['journey','map',T('Traseul meu','My route')],['missions','compass',T('Misiuni','Missions')],['speaking','volume',T('Spune cu voce tare','Say it out loud')],['exports','download',T('Export Anki','Anki export')],['placement','flag',T('Orientare','Placement')],['practice','bolt',T('Antrenament','Training')],['collection','book',T('Cuvinte & expresii','Words & phrases')],['progress','trophy',T('Pașaportul meu','My passport')]].map(([v,i,t])=>`<button class="nav-item ${view===v?'active':''}" data-nav="${v}" aria-label="${t}" ${view===v?'aria-current="page"':''}>${icon(i)}<span>${t}</span>${v==='practice'&&reviewed().length?`<b>${reviewed().length}</b>`:''}</button>`).join('')}
   </nav>
   <div class="sidebar-bottom"><div class="level-mini">${icon('spark')}<div><strong>${T('Rang','Rank')} ${xpLevel}</strong><span>${state.xp} ${T('XP adunate','XP collected')}</span></div></div>${progressBar(state.xp%200,200)}<p>${T('Încă','Another')} ${200-state.xp%200} ${T('XP până la rangul','XP to rank')} ${xpLevel+1}.</p><button class="teacher-link" data-nav="teacher">${icon('pen')} ${T('Pentru profesor','For the teacher')}</button><span class="school-name">Centrul de Arabă Libaneză<br>${T('cu Ibrahim','with Ibrahim')}</span></div>
  </aside>
  <div class="app-body"><header class="topbar"><div class="breadcrumb"><span>Centrul de Arabă Libaneză</span><span class="crumb-divider">/</span><strong>${session?T('Misiune în desfășurare','Mission in progress'):{journey:T('Traseul meu','My route'),teacher:T('Atelierul profesorului','Teacher\'s workshop'),exports:T('Export Anki','Anki export'),speaking:T('Spune cu voce tare','Say it out loud'),missions:T('Joacă și învață','Play and learn'),adventure:T('O zi în Liban','A day in Lebanon'),placement:T('Punctul de pornire','Starting point'),practice:T('Antrenament','Training'),collection:T('Cuvinte & expresii','Words & phrases'),progress:T('Pașaportul meu','My passport'),about:T('Pentru profesor','For the teacher')}[view]}</strong></div><div class="top-stats"><span class="xp-pill">${icon('bolt')} ${state.xp} XP</span><span class="profile-avatar" title="${T('Progres pe acest dispozitiv','Progress on this device')}">${xpLevel}</span></div></header><main id="main" tabindex="-1">${content}</main><footer>Progres salvat ${saveFailed?T('doar pentru această sesiune','for this session only'):T('în acest browser','in this browser')}. ${saveFailed?T('Stocarea locală nu este disponibilă.','Local storage is not available.'):T('Pe alt dispozitiv începi cu un pașaport nou.','On another device you start with a new passport.')} <button class="footer-link" data-nav="teacher">${T('Pentru profesor','For the teacher')}</button></footer></div>`;
 }
 function missionCard(u,index){const count=unitItems(u.id).length,p=learned(u.id);return `<button class="mission-card ${u.id===state.lastUnit?'recommended':''}" data-unit="${u.id}"><span class="mission-icon">${icon(u.icon)}</span><span class="mission-main"><span class="mission-meta">${u.group==='A1'?T('LECȚIA ','LESSON ')+(index+1):u.group===T('Verbe extra','Extra verbs')?T('ENGLEZĂ ↔ ARABIZI','ENGLISH ↔ ARABIZI'):T('EXPLOREAZĂ','EXPLORE')}</span><strong>${h(u.title)}</strong><span class="mission-desc">${h(u.desc)}</span><span class="mission-foot"><span>${count} ${T('provocări','challenges')}</span><span>${p}/${count} ${T('consolidate','consolidated')}</span></span>${progressBar(p,count)}</span><span class="mission-enter">${icon('arrow')}</span></button>`;}
 function missions(){const today=state.daily[day()]||0;const recommended=D.units.find(u=>u.id===state.lastUnit)||D.units[0];/* A lesson with no cards left is not offered. Sixteen source units were
    emptied when the owner removed duplicate cards from the reviewed bank,
    and one curriculum lesson (a1-health) lost all of its. They stay in the
    data — curriculum.js throws on a source unit it cannot map — but an
    empty mission is a dead end for the learner, so it is filtered here. */
 const groupUnits=D.units.filter(u=>u.group===group&&unitItems(u.id).length>0);
  shell(`<div class="page-heading"><div><div class="eyebrow">${T('PAS CU PAS, PÂNĂ LA CONVERSAȚIE','STEP BY STEP, ALL THE WAY TO CONVERSATION')}</div><h1>${T('Yalla, hai să jucăm!','Yalla, let us play!')}</h1></div><span class="date-chip">${icon('sun')} ${T('O rundă. Zece provocări.','One round. Ten challenges.')}</span></div>
  <section class="start-panel" aria-label="${T('Începe să joci','Start playing')}"><div class="start-copy"><span class="panel-kicker">${T('URMĂTOAREA TA MISIUNE','YOUR NEXT MISSION')} <span>${h(gl(recommended.group))}</span></span><h2>${h(recommended.title)}</h2><p>${h(recommended.desc)}<br>${T('O alegere bună, încă un pas spre libaneză.','A good choice — one more step towards Lebanese.')}</p><div class="start-actions"><button class="btn primary" data-start="${recommended.id}">${icon('bolt')} ${state.rounds?T('Continuă aventura','Continue the adventure'):T('Începe aventura','Start the adventure')} ${icon('arrow')}</button><button class="text-btn" data-study="${recommended.id}">${T('Vezi mai întâi cuvintele','See the words first')}</button></div><div class="start-details"><span>${icon('check')} ${T('Fără limită de timp','No time limit')}</span><span>${icon('chat')} ${T('În Arabizi','In Arabizi')}</span></div></div><div class="start-art"><img src="./beirut-cafe.png" alt="${T('Ilustrație a unei cafenele libaneze deasupra Mediteranei','An illustration of a Lebanese caf\u00e9 above the Mediterranean')}" width="1536" height="1024" fetchpriority="high"><span class="art-stamp">MAR7ABA<br><small>beirut</small></span></div></section>
  <div class="mission-layout"><section class="mission-list"><div class="section-top"><div><h2>${T('Alege-ți misiunea','Choose your mission')}</h2><p>${T('Explorează în ritmul tău. Toate misiunile sunt deschise.','Explore at your own pace. Every mission is open.')}</p></div><span class="count-label">${D.units.length} misiuni</span></div><div class="group-tabs" role="group" aria-label="Categorii">${[...new Set(D.units.map(u=>u.group))].map(g=>`<button data-group="${g}" class="${group===g?'selected':''}" aria-pressed="${group===g}">${h(gl(g))}</button>`).join('')}</div>${group===T('Verbe extra','Extra verbs')?`<p class="language-note">${T('Indexul extins păstrează sensurile în engleză din dicționar. Formele sunt pentru vocabular, nu un tabel de conjugare.','The extended index keeps the dictionary English meanings. The forms are vocabulary, not a conjugation table.')}</p>`:''}<div class="missions">${groupUnits.map(missionCard).join('')}</div></section>
  <aside class="side-widgets"><section class="daily-card"><div class="widget-title">${icon('flag')} Misiunea de azi</div><h3>${T('10 răspunsuri bune.','10 right answers.')}</h3><p>${T('Puțină practică, în fiecare zi.','A little practice, every day.')}</p>${progressBar(Math.min(today,10),10)}<div class="daily-bottom"><strong>${Math.min(today,10)} / 10</strong><span>${today>=10?T('Misiune îndeplinită!','Mission complete!'):T('Hai că poți!','You can do this!')}</span></div></section>
  <section class="memory-card"><span class="tiny-label">${T('ȚII MINTE?','REMEMBER?')}</span><div class="memory-pair"><strong>5 = kh</strong><strong>8 = gh</strong></div><p><b>5all</b> și <b>khall</b> ${T('înseamnă același lucru: oțet. Jocul le acceptă pe amândouă.','mean the same thing: vinegar. The game accepts both.')}</p></section>
  <button class="review-callout" data-review>${icon('refresh')}<span><strong>${T('Reia greșelile','Redo your mistakes')}</strong><small>${reviewed().length?reviewed().length+T(' provocări te așteaptă',' challenges are waiting'):T('Greșelile sunt pași înainte.','Mistakes are steps forward.')}</small></span>${icon('arrow')}</button>
  <div class="quiet-stat">${icon('layers')}<span><b>${D.cards.length.toLocaleString('ro-RO')}</b> ${T('carduri','cards')} · <b>${D.drills.length}</b> ${T('exerciții','exercises')}<br>${T('din lecțiile și fișele tale','from your lessons and worksheets')}</span></div></aside></div>`);
 }
 function unitScreen(id){id=window.YallaCurriculum.resolve(id);chosenUnit=id;const u=D.units.find(x=>x.id===id);const cnt=unitItems(id).length;const dialogCount=D.drills.filter(q=>q.unit===id&&q.dialog).length;
  shell(`<button class="back-link" data-nav="missions">${icon('back')} ${T('Toate misiunile','All missions')}</button><section class="unit-intro"><div class="unit-symbol">${icon(u.icon)}</div><div class="eyebrow">${h(gl(u.group))} · ${cnt} ${T('provocări','challenges')}</div><h1>${h(u.title)}</h1><p>${h(u.desc)}</p><div class="unit-tips">${u.tips.map(t=>`<p>${icon('check')}<span>${h(t)}</span></p>`).join('')}</div>${u.learningNotes?.length?`<div class="teacher-panel"><h2>${T('Înainte să începi','Before you start')}</h2>${u.learningNotes.map(l=>`<details><summary>${h(l.title)}</summary><ul>${l.points.map(p=>`<li>${h(p)}</li>`).join('')}</ul><p><b>${T('Spune cu voce tare:','Say it out loud:')}</b> ${h(l.speaking)}</p></details>`).join('')}</div>`:''}<h2>${T('Cum vrei să joci?','How do you want to play?')}</h2><div class="mode-grid">${modeCards(id,dialogCount)}</div><p class="muted">${T('Fiecare rundă are 20 de provocări. Temele mici sunt completate cu recapitulare din același nivel. Greșelile se reiau separat.','Each round has 20 challenges. Small topics are filled out with revision from the same level. Mistakes are redone separately.')}</p></section>`);
 }
 function modeCards(id,dialogCount){return [['mix','bolt',T('Misiune mixtă','Mixed mission'),T('Alege, traduce și reconstruiește.','Choose, translate and rebuild.')],['cards','layers',T('Descoperă','Discover'),T('Învață sensul și spune-l cu voce tare.','Learn the meaning and say it out loud.')],['pairs','link',T('Găsește perechile','Find the pairs'),T('Unește cuvintele cu sensurile lor.','Match the words to their meanings.')],['write','keyboard',T('Fără variante','No options'),T('Scrie răspunsul în Arabizi.','Type your answer in Arabizi.')],['order','pen',T('Construiește','Build'),T('Pune cuvintele în ordinea potrivită.','Put the words in the right order.')],...(dialogCount?[['dialog','chat',T('În conversație','In conversation'),T('Alege replica potrivită situației.','Pick the right reply for the situation.')]]:[])].filter(([m])=>{if(id==='core')return E.unique(eligible('core',m),E.roundKey).length>=20;const g=D.units.find(u=>u.id===id)?.group;return E.unique(D.units.filter(u=>u.group===g).flatMap(u=>eligible(u.id,m)),E.roundKey).length>=20;}).map(([m,i,t,d])=>`<button class="mode-card" data-play-unit="${id}" data-mode="${m}">${icon(i==='link'?'layers':i)}<strong>${t}</strong><span>${d}</span>${m==='mix'?`<small>${T('RECOMANDAT','RECOMMENDED')}</small>`:''}</button>`).join('');}
 function training(){const rs=reviewed();shell(`<div class="page-heading"><div><div class="eyebrow">${T('UN PIC MAI BINE, LA FIECARE RUNDĂ','A LITTLE BETTER, EVERY ROUND')}</div><h1>${T('Antrenamentul tău','Your training')}</h1><p>${T('Alege un traseu și combină lecțiile lui într-o rundă.','Choose a route and combine its lessons into one round.')}</p></div></div><div class="training-highlight"><div>${icon('refresh')}<h2>${T('Greșelile de ieri, reușitele de azi.','Yesterday mistakes, today wins.')}</h2><p>${rs.length?rs.length+T(' provocări au nevoie de încă o încercare.',' challenges need another try.'):T('Încă nu ai provocări de reluat. Joacă o misiune ca să începi.','No challenges to redo yet. Play a mission to get started.')}</p></div><button class="btn primary" data-review>${T('Reia greșelile','Redo your mistakes')} ${icon('arrow')}</button></div><label class="filter-label training-filter"><span>Traseu de exersat</span><select id="training-group">${(D.levels||[]).map(l=>`<option value="${h(l.id)}" ${trainingLevel===l.id?'selected':''}>${h(l.id)} · ${D.cards.filter(upToLevel(l.id)).length} ${T('carduri','cards')}</option>`).join('')}</select></label><div class="mode-grid training-modes">${modeCards('core',D.drills.filter(q=>q.dialog).length)}</div><div class="coach-note">${icon('info')}<p>${T('La scriere acceptăm majuscule, semne de punctuație, vocale prelungite și variantele kh/5, gh/8. Sufixele de persoană și consoanele duble contează.','When you write we accept capitals, punctuation, long vowels and the kh/5, gh/8 variants. Person suffixes and doubled consonants do matter.')}</p></div>`);}
 function collection(){const items=D.cards.filter(c=>(lexUnit==='all'||c.unit===lexUnit)&&(!lexQuery||[c.ar,c.ro,c.en,...(c.variants||[])].some(s=>E.norm(s).includes(E.norm(lexQuery)))));const pages=Math.max(1,Math.ceil(items.length/30));lexPage=Math.min(lexPage,pages-1);const current=items.slice(lexPage*30,lexPage*30+30);
 shell(`<div class="page-heading"><div><div class="eyebrow">${T('CAIETUL TĂU DE BUZUNAR','YOUR POCKET NOTEBOOK')}</div><h1>${T('Cuvinte & expresii','Words & phrases')}</h1><p>${D.cards.length.toLocaleString(T('ro-RO','en-GB'))} ${T('carduri. Caută un cuvânt, o expresie sau un sens.','cards. Search for a word, a phrase or a meaning.')}</p></div></div><div class="collection-tools"><label class="search-field">${icon('search')}<input id="word-search" type="search" value="${h(lexQuery)}" placeholder="${T('Caută: mar7aba, cafea, familie…','Search: mar7aba, coffee, family…')}" aria-label="${T('Caută în vocabular','Search the vocabulary')}"></label><label class="filter-label"><span>Misiune</span><select id="unit-filter"><option value="all">${T('Toate misiunile','All missions')}</option>${D.units.map(u=>`<option value="${u.id}" ${u.id===lexUnit?'selected':''}>${h(u.title)}</option>`).join('')}</select></label></div><div class="collection-count">${items.length} ${T('rezultate','results')} <span>${T('Consolidat = 3 răspunsuri corecte fără indiciu','Consolidated = 3 correct answers with no hint')}</span></div><div class="vocab-grid">${current.length?current.map(c=>`<article class="vocab-card"><div class="vocab-top"><span>${h(D.units.find(u=>u.id===c.unit)?.title)}</span>${(state.progress[c.id]?.streak||0)>=3?`<span class="master-check" title="Consolidat">${icon('check')}</span>`:state.progress[c.id]?.wrong?`<span class="retry-label">De reluat</span>`:''}</div><h2 dir="ltr">${h(c.ar)}</h2><p>${c.lang==='en'?'<span class="en-tag">EN</span> ':''}${h(c.ro)}</p>${c.variants?`<p class="variants">${T('Și:','Also:')} ${c.variants.map(h).join(' / ')}</p>`:''}${c.note?`<details><summary>${T('Notă de învățare','Learning note')}</summary><p>${h(c.note)}</p></details>`:''}<small>${h(sourceLine(c))}</small>${canEdit()?(editingCard===c.id?editForm(c):`<button class="btn secondary inline-edit-open" data-start-edit="${c.id}">${T('Corectează','Fix it')}</button>`):''}</article>`).join(''):`<div class="empty-state">${T('Nu am găsit acest cuvânt. Încearcă un alt termen sau o altă misiune.','We could not find that word. Try another term or another mission.')}</div>`}</div><div class="pagination"><button class="btn secondary" data-page="${lexPage-1}" ${lexPage===0?'disabled':''}>${icon('back')} ${T('Înapoi','Back')}</button><span>${T('Pagina','Page')} ${lexPage+1} ${T('din','of')} ${pages}</span><button class="btn secondary" data-page="${lexPage+1}" ${lexPage>=pages-1?'disabled':''}>${T('Înainte','Next')} ${icon('arrow')}</button></div>`);
 }
 function passport(){const badges=[['first',T('Primul pas','First step'),T('Termină prima rundă.','Finish your first round.'),'flag',state.rounds>=1],['hundred',T('Prinzi curaj','Finding your nerve'),T('Adună 100 XP.','Collect 100 XP.'),'bolt',state.xp>=100],['collector',T('Culegător de cuvinte','Word gatherer'),T('Exersează 50 de carduri.','Practise 50 cards.'),'book',practiced()>=50],['steady',T('Pas cu pas','Step by step'),T('Consolidează 20 de carduri.','Consolidate 20 cards.'),'star',mastered()>=20],['ten',T('Ritm bun','Good rhythm'),T('Încheie 10 runde.','Complete 10 rounds.'),'trophy',state.rounds>=10]];
 shell(`<div class="page-heading"><div><div class="eyebrow">${T('FIECARE ÎNCERCARE CONTEAZĂ','EVERY ATTEMPT COUNTS')}</div><h1>${T('Pașaportul meu','My passport')}</h1><p>${T('Progresul tău pe acest dispozitiv.','Your progress on this device.')}</p></div></div><div class="passport-banner"><div class="passport-seal">${icon('compass')}<span>YALLA CLUB</span></div><div><span>RANG ${Math.floor(state.xp/200)+1}</span><h2>${state.xp<200?T('Explorator în devenire','Explorer in the making'):state.xp<1000?T('Călător curios','Curious traveller'):T('Prieten al libanezei','Friend of Lebanese')}</h2><p>${state.xp} XP · aventura merge mai departe.</p></div></div><div class="stat-grid">${[[state.rounds,T('runde încheiate','rounds completed')],[practiced(),T('provocări încercate','challenges attempted')],[mastered(),T('carduri consolidate','cards consolidated')],[reviewed().length,T('de reluat','to redo')]].map(([n,t])=>`<div><strong>${n}</strong><span>${t}</span></div>`).join('')}</div><h2>Insignele tale</h2><div class="badges">${badges.map(([id,t,d,i,done])=>`<div class="badge-card ${done?'earned':''}"><span>${icon(i)}</span><strong>${t}</strong><p>${d}</p><small>${done?T('CÂȘTIGATĂ','EARNED'):T('ÎN LUCRU','IN PROGRESS')}</small></div>`).join('')}</div><h2>${T('Drumul prin lecții','The path through the lessons')}</h2><div class="progress-list">${D.units.filter(u=>unitItems(u.id).length>0&&(u.group==='A1'||unitItems(u.id).some(c=>state.progress[c.id]?.seen))).map(u=>`<button data-unit="${u.id}"><span>${icon(u.icon)}${h(u.title)}</span>${progressBar(learned(u.id),unitItems(u.id).length)}<b>${learned(u.id)} / ${unitItems(u.id).length}</b></button>`).join('')}</div><p class="muted">${T('„Consolidat” înseamnă trei răspunsuri corecte consecutive fără indiciu. Este un indicator de practică, nu o notă la curs.','“Consolidated” means three correct answers in a row with no hint. It is a practice indicator, not a course grade.')}</p>`);
 }
 function about(){shell(`<div class="page-heading"><div><div class="eyebrow">CENTRUL DE ARABĂ LIBANEZĂ</div><h1>${T('Jocul, la curs','The game, in class')}</h1><p>${T('Folosește misiunile individual sau proiectează jocul pentru un răspuns de echipă.','Use the missions one to one, or project the game for a team answer.')}</p></div></div><section class="teacher-panel"><p><button class="btn primary" data-nav="teacher">${T('Deschide atelierul de corecturi','Open the corrections workshop')}</button></p>${!window.YALLA_OFFLINE&&!window.YALLA_PACKAGED?`<p><a class="btn secondary" href="./yalla-website-package.zip" download>${T('Descarcă sursele pentru integrarea pe website','Download the sources for website integration')}</a></p>`:''}<details><summary>${T('Povești — prototip separat','Stories — a separate prototype')}</summary><p>${T('Poveștile vor fi dezvoltate ulterior, separat de joc.','The stories will be built later, separately from the game.')}</p><button class="btn secondary" data-nav="adventure">${T('Vezi prototipurile existente','See the existing prototypes')}</button></details><h2>${T('Un ritm simplu pentru elevi','A simple rhythm for students')}</h2><ol><li><b>${T('Descoperă:','Discover:')}</b> ${T('întorc cardurile și rostesc cuvintele cu voce tare.','they flip the cards and say the words out loud.')}</li><li><b>${T('Joacă:','Play:')}</b> ${T('o misiune mixtă de 20 de provocări.','a mixed mission of 20 challenges.')}</li><li><b>${T('Recuperează:','Catch up:')}</b> ${T('reiau greșelile și construiesc o propoziție proprie la curs.','they redo their mistakes and build a sentence of their own in class.')}</li></ol><p>${T('XP și progresul rămân în browserul folosit. Nu există conturi de elev, clasament comun sau raportare automată către profesor. Pronunția se exersează cu profesorul; jocul nu include voci sintetice prezentate drept libaneze.','XP and progress stay in the browser used. There are no student accounts, no shared leaderboard and no automatic reporting to the teacher. Pronunciation is practised with the teacher; the game includes no synthetic voices presented as Lebanese.')}</p>${window.YALLA_OFFLINE?`<p><b>${T('Acesta este jocul complet. Trimite acest fișier HTML elevilor tăi.','This is the whole game. Send this HTML file to your students.')}</b></p>`:'<a class="btn primary" href="./yalla-offline.html" download="Yalla-joc-araba-libaneza.html">'+icon('download')+' '+T('Descarcă jocul pentru elevi','Download the game for students')+'</a>'}<p class="muted">${T('Un singur fișier HTML, cu lecțiile și imaginea incluse. Elevii îl deschid într-un browser, inclusiv fără internet. Fiecare păstrează propriul progres.','A single HTML file, lessons and image included. Students open it in a browser, offline too. Each keeps their own progress.')}</p></section><section class="teacher-panel"><h2>${T('Organizarea pe niveluri','How the levels are organised')}</h2><p>${T('Încadrarea este o propunere pedagogică după planul A1–C2, nu o validare CEFR a fiecărui cuvânt. A1 păstrează primele utilizări ale trecutului și viitorului; A2 consolidează sistemul verbal, participiile și legăturile între idei. Fișele A2 care repetă A1 sunt reunite cu recapitularea A1. B1 include practică ghidată de integrare. B2–C2 au obiective planificate. Niciun scor din joc nu certifică nivelul CEFR.','The placement is a pedagogical proposal following the A1–C2 plan, not a CEFR validation of every word. A1 keeps the first uses of the past and the future; A2 consolidates the verb system, the participles and the links between ideas. The A2 sheets that repeat A1 are merged with the A1 revision. B1 includes guided integration practice. B2–C2 have planned objectives. No score in the game certifies a CEFR level.')}</p><h2>${T('Acoperirea materialelor','What the materials cover')}</h2><p>${T('Lecțiile din joc reunesc temele comune din surse. Unitățile originale și ID-urile cardurilor sunt păstrate în metadate. Notele din martie acoperă lecțiile 1–21 și 23; planul Excel are altă ordine. Fișele din A2 sunt recapitulări A1; posterele sunt planuri de curs, nu lecții complete. Ghidul este un supliment: toate cele 16 capitole sunt reprezentate prin vocabular, expresii, reguli sau recapitulare integrată. Dialogurile sunt adaptate în provocări de replică; sarcinile de vorbire rămân deschise, fără notare automată. Cardurile se pot repeta între trasee pentru recapitulare.','The lessons in the game bring together the themes the sources share. The original units and the card IDs are kept in the metadata. The March notes cover lessons 1–21 and 23; the Excel plan has a different order. The A2 sheets are A1 revision; the posters are lesson plans, not complete lessons. The guide is a supplement: all 16 chapters are represented through vocabulary, phrases, rules or integrated revision. The dialogues are adapted into reply challenges; the speaking tasks stay open, with no automatic marking. Cards can repeat across tracks for revision.')}</p><p>${D.cards.length} ${T('carduri și','cards and')} ${D.drills.length} ${T('exerciții în','exercises across')} ${D.units.length} ${T('misiuni.','missions.')} ${T('Vocabularul tematic are sensuri în română. Formele din index necesită revizie lingvistică; acestea nu constituie paradigme de conjugare.','The thematic vocabulary carries Romanian meanings. The forms in the index need a linguistic review; they are not conjugation paradigms.')}</p><div class="source-list">${D.sources.map(s=>`<div><b>${h(s.title)}</b><span>${h(s.detail)}</span><small>${allItems.filter(c=>c.source===s.id).length} ${T('carduri și provocări','cards and challenges')}</small></div>`).join('')}</div><p class="muted">${T('Conținut adaptat din lecțiile, fișele și tabelele furnizate. Materialele profesorului au prioritate față de ghidul suplimentar. Dicționar: © 2019 Ali Matar. Grafiile sunt păstrate, cu variante explicite. Rezolvările libere și textele de producție se discută cu profesorul.','Content adapted from the lessons, sheets and tables provided. The teacher\'s own materials take precedence over the supplementary guide. Dictionary: © 2019 Ali Matar. The spellings are kept, with explicit variants. Open answers and production texts are discussed with the teacher.')}</p></section><section class="teacher-panel"><details><summary><strong>${D.notes.length} ${T('observații de verificat în materialele sursă','notes to check in the source material')}</strong></summary><p>${T('Aceasta este o versiune de lucru pentru revizia profesorului. Au fost folosite exemple lizibile și cheile de răspuns; corecturile lingvistice pot fi aplicate ulterior. Mai jos apar neconcordanțele identificate și deciziile de adaptare.','This is a working version for the teacher to review. Legible examples and the answer keys were used; linguistic corrections can come later. The mismatches found and the adaptation decisions are below.')}</p>${D.notes.map(n=>`<div class="review-note"><b>${h(n.original)}</b><p>${h(n.reason)}</p><small>${h(originalSourceLine(n))}</small></div>`).join('')}</details></section>`);}

 function setView(v){window.YallaAcademy?.leave();clearTimeout(searchTimer);if(session&&!session.done){showLeave(v);return;}session=null;view=v;render();window.scrollTo({top:0});}
 function render(){if(['journey','teacher','exports','speaking'].includes(view)&&!session){window.YallaAcademy.render(view);return;}if(session){renderGame();return;}if(['adventure','placement'].includes(view)){window.YallaPlus.render(view);return;}if(view==='missions')missions();else if(view==='practice')training();else if(view==='collection')collection();else if(view==='progress')passport();else about();}
 /* A training round draws everything up to the chosen level, not only that
    level: a conversation at A2 still needs its A1 words, which is how the owner
    classified the bank. The old pool filtered by the LESSON's group, and those
    groups mislabel difficulty badly — group "A1" held 288 A2 cards and 11 B1
    ones, group "A2" held 223 A1 cards — so the level on the card is the honest
    filter. */
 const levelOrder=()=>(D.levels||[]).map(l=>l.id);
 const upToLevel=lvl=>{const o=levelOrder(),top=o.indexOf(lvl);return c=>{const i=o.indexOf(c.level);return i>=0&&(top<0||i<=top);};};
 function poolFor(id){return id==='core'?D.cards.filter(upToLevel(trainingLevel)):D.cards.filter(c=>c.unit===id);}
 const recentRounds={};
 function eligible(id,selectedMode){
  let cards=poolFor(id),drills=D.drills.filter(c=>{if(id!=='core')return c.unit===id;const ok=upToLevel(trainingLevel);return D.cards.some(x=>x.unit===c.unit&&ok(x));});
  if(selectedMode==='dialog')return drills.filter(d=>d.dialog);
  if(selectedMode==='order')return cards.filter(c=>c.ar.trim().split(/\s+/).length>=3&&c.ar.trim().split(/\s+/).length<=12);
  if(['cards','pairs','write'].includes(selectedMode))return cards;
  return [...cards,...drills];
 }
 function start(id,selectedMode='mix',review=false,scheduled=false){
  id=window.YallaCurriculum.resolve(id);
  const previous=session;
  if(id==='review'){review=true;id=previous?.unit&&previous.unit!=='review'?previous.unit:state.lastUnit||'a1-welcome';}
  window.YallaAcademy?.leave();clearTimeout(searchTimer);mode=selectedMode;
  const u=D.units.find(u=>u.id===id),scope=u?.group||null;
  const base=eligible(id,mode),siblings=(scope?D.units.filter(x=>x.group===scope&&x.id!==id):[]).flatMap(x=>eligible(x.id,mode));
  let primary=scheduled?E.due([...D.cards,...D.drills],state.progress):review?[...D.cards,...D.drills].filter(c=>state.progress[c.id]?.wrong):base;
  if(review&&mode!=='mix')primary=primary.filter(c=>[...base,...siblings].some(x=>x.id===c.id));
  if((review||scheduled)&&!primary.length){toast(scheduled?T('Nu ai recapitulări programate pentru azi. Începe un set nou!','No reviews scheduled for today. Start a new set!'):T('Nicio greșeală de reluat. Începe un set nou!','No mistakes to redo. Start a new set!'));return;}
  let fallback=[...base,...siblings];
  if(mode==='pairs'){primary=E.unique(E.unique(primary,c=>E.norm(c.ar)),c=>E.norm(c.ro));fallback=E.unique(E.unique([...primary,...fallback],c=>E.norm(c.ar)),c=>E.norm(c.ro));}
  const key=id+'|'+mode, selected=E.round(primary,fallback,state.progress,recentRounds[key]||[],mode==='mix'&&!review&&!scheduled?primary.length+fallback.length:20,review||scheduled);
  if(selected.length<20){toast(T('Acest format nu are încă 20 de elemente diferite. Alege o rundă mixtă.','This format doesn\'t have 20 different items yet. Pick a mixed round.'));return;}

  const questions=mode==='mix'&&!review&&!scheduled?E.mixed(selected,D.cards):selected.map((c,i)=>c.prompt?{id:c.id,type:'drill',drill:c,answer:c.answer,options:E.shuffle([c.answer,...E.shuffle(c.wrong).slice(0,3)])}:E.makeQuestion(c,D.cards,mode,i));
  recentRounds[key]=questions.map(q=>E.roundKey(q.card||q.drill));
  session={unit:id,title:scheduled?T('Recapitularea de azi','Today\'s review'):review?T('Reia greșelile · cu recapitulare','Redo mistakes · with review'):u?.title||T('Antrenament · ','Training · ')+trainingLevel,mode,questions,index:0,initial:20,correct:0,streak:0,xp:0,misses:[],answered:false,hinted:false,result:null,selectedTokens:[],revealed:false,done:false,review,learned:0};
  if(mode==='pairs'){Object.assign(session,{pairCards:selected,boardOffset:0,pairCompleted:0,pairWrong:new Set()});nextPairBoard();}
  if(u){state.lastUnit=u.id;save();}renderGame();window.scrollTo({top:0});
 }
 function nextPairBoard(){const s=session,chosen=s.pairCards.slice(s.boardOffset,s.boardOffset+5);Object.assign(s,{left:chosen,right:E.shuffle(chosen),matched:[],pairLeft:null,pairRight:null,pairError:null,pairBusy:false});}
 function gameHeader(){const s=session;const complete=s.mode==='pairs'?s.pairCompleted+s.matched.length:s.index;const total=s.mode==='pairs'?s.initial:s.questions.length;
 return `<div class="game-top"><button class="icon-button" data-leave aria-label="${T('Ieși din misiune','Leave the mission')}">${icon('close')}</button><div class="game-progress">${progressBar(complete,total)}<span>${complete} / ${total} ${s.mode==='pairs'?'perechi':T('provocări','challenges')}</span></div><span class="round-xp">${icon('bolt')} ${s.xp} XP</span></div><div class="game-meta"><span>${h(s.title)}</span><span>${s.streak>=2?icon('spark')+' '+s.streak+T(' la rând',' in a row'):T('În ritmul tău','At your own pace')}</span></div>`;
 }
 function renderGame(){if(session.done){resultsScreen();return;}if(session.mode==='pairs'){pairsScreen();return;}const s=session,q=s.questions[s.index],c=q.card;const grammar=q.type==='drill';
  let body='';let label={choice:T('ALEGE EXPRESIA','PICK THE PHRASE'),reverse:T('DESCIFREAZĂ SENSUL','WORK OUT THE MEANING'),order:T('RECONSTRUIEȘTE','REBUILD'),write:T('SCRIE ÎN ARABIZI','WRITE IN ARABIZI'),learn:T('DESCOPERĂ UN CUVÂNT','DISCOVER A WORD'),drill:q.drill?.dialog?T('ÎN CONVERSAȚIE','IN CONVERSATION'):T('PROVOCARE DE GRAMATICĂ','GRAMMAR CHALLENGE')}[q.type];
  let heading=grammar?q.drill.prompt:q.type==='choice'?(c.lang==='en'?T('Cum spui în Arabizi? (sens în engleză)','How do you say it in Arabizi? (English meaning)'):T('Cum spui în libaneză?','How do you say it in Lebanese?')):q.type==='reverse'?(c.lang==='en'?T('Alege sensul în engleză.','Pick the English meaning.'):T('Ce înseamnă?','What does it mean?')):q.type==='order'?T('Pune cuvintele în ordine.','Put the words in order.'):q.type==='write'?T('Îți amintești expresia?','Do you remember the phrase?'):T('Privește. Rostește. Ține minte.','Look. Say it. Remember.');
  let prompt=grammar?q.drill.context:q.type==='reverse'?c.ar:c.ro;
  if(q.type==='choice'||q.type==='reverse'||grammar){body=`<div class="answer-grid ${q.type==='reverse'?'translations':''}">${q.options.map((opt,i)=>{let cls='';if(s.answered){if(E.exact(opt)===E.exact(q.answer))cls='is-correct';else if(s.selectedOption===opt)cls='is-wrong';else cls='is-muted';}return `<button class="answer-option ${cls}" data-answer-index="${i}" ${s.answered?'disabled':''}><span class="answer-number">${i+1}</span><span dir="ltr">${h(opt)}</span>${cls==='is-correct'?icon('check'):cls==='is-wrong'?icon('close'):''}</button>`;}).join('')}</div>`;}
  else if(q.type==='order'){
    body=`<div class="sentence-build ${s.answered?(s.result?'correct-build':'wrong-build'):''}" aria-label="${T('Propoziția construită','The sentence you built')}">${s.selectedTokens.length?s.selectedTokens.map(id=>`<button class="word-token chosen" data-remove-token="${id}" ${s.answered?'disabled':''}>${h(q.tokens.find(t=>t.id===id).text)}</button>`).join(''):'<span>Atinge cuvintele de mai jos…</span>'}</div><div class="token-pool">${q.tokens.map(t=>`<button class="word-token ${s.selectedTokens.includes(t.id)?'used':''}" data-token="${t.id}" ${s.answered||s.selectedTokens.includes(t.id)?'disabled':''}>${h(t.text)}</button>`).join('')}</div>${!s.answered?`<button class="btn primary check-button" data-check-order ${s.selectedTokens.length!==q.tokens.length?'disabled':''}>${T('Verifică','Check')} ${icon('check')}</button>`:''}`;
  }else if(q.type==='write'){
    body=`<form id="write-form"><label for="typed-answer" class="input-label">${T('Răspunsul tău','Your answer')}</label><input id="typed-answer" class="typed-answer ${s.answered?(s.result?'correct-build':'wrong-build'):''}" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${T('Scrie aici în Arabizi…','Write here in Arabizi…')}" value="${h(s.typed||'')}" ${s.answered?'disabled':''}><p class="input-help">${T('Poți scrie 5 sau kh, 8 sau gh. Nu contează majusculele ori punctuația.','You can write 5 or kh, 8 or gh. Capitals and punctuation do not matter.')}</p>${!s.answered?`<button class="btn primary check-button" type="submit">${T('Verifică','Check')} ${icon('check')}</button>`:''}</form>`;
  }else if(q.type==='learn'){
    body=`<button class="flash-card ${s.revealed?'flipped':''}" data-flip aria-label="${s.revealed?T('Ascunde','Hide'):T('Arată','Show')} expresia în Arabizi"><span class="flash-side">${s.revealed?'ARABIZI':T('SPUNE CU VOCE TARE','SAY IT OUT LOUD')}</span><strong>${s.revealed?h(c.ar):'?'}</strong><span>${s.revealed?T('Atinge pentru a întoarce cardul.','Tap to flip the card.'):T('Atinge ca să descoperi expresia.','Tap to reveal the phrase.')}</span></button>${s.revealed?`<p class="card-note">${h(c.note||T('Rostește cuvântul. Apoi încearcă să îl folosești într-o propoziție.','Say the word out loud. Then try using it in a sentence.'))}</p><div class="learn-actions"><button class="btn secondary" data-learn="again">Mai exersez</button><button class="btn primary" data-learn="known">Am parcurs cardul ${icon('arrow')}</button></div>`:''}`;
  }
  const hint=s.hinted&&!s.answered&&q.type!=='learn'?`<div class="hint-box">${icon('info')}<span>${grammar?h(q.drill.note):q.type==='reverse'?h(c.note||T('Sensul începe cu: ','The meaning starts with: ')+c.ro.slice(0,Math.max(1,Math.ceil(c.ro.length/3)))+'…'):T('Începe cu:','Starts with:')+' <b>'+h(c.ar.slice(0,Math.max(1,Math.ceil(c.ar.length/3))))+'…</b>'} <small>${T('Cu indiciu, cardul rămâne de exersat.','With a hint, the card stays to be practised.')}</small></span></div>`:'';
  const feedback=s.answered?`<div class="feedback ${s.result?'positive':'negative'}" role="status"><div class="feedback-symbol">${icon(s.result?'check':'refresh')}</div><div><strong>${s.result?(s.hinted?T('Ai găsit! Încearcă data viitoare fără indiciu.','Found it! Next time try without the hint.'):s.streak>=3?T('Ktiir mnii7! Continuă așa.','Ktiir mnii7! Keep it up.'):T('Mnii7! Ai răspuns corect.','Mnii7! That\'s correct.')):T('Încă un pas spre răspunsul bun.','One more step to the right answer.')}</strong>${!s.result?`<p>${T('Răspuns:','Answer:')} <b dir="ltr">${h(q.answer)}</b></p>`:''}<p>${h(grammar?q.drill.note:['write','order'].includes(q.type)?E.feedback(c,s.typed):c.note||(q.type==='reverse'?c.ar+' = '+c.ro:c.ro))}</p></div>${!s.result?(s.fixed?`<div class="fix-row done" role="status">${icon('check')}<span>${T('Exact. Cardul rămâne programat pentru recapitulare.','Exactly. The card stays scheduled for revision.')}</span></div>`:`<form id="fix-form" class="fix-row" autocomplete="off"><label for="fix-answer">${T('Scrie-l corect','Write it correctly')}</label><input id="fix-answer" dir="ltr" autocapitalize="off" autocorrect="off" spellcheck="false" value="${h(s.fixTyped||'')}" placeholder="${h(q.answer)}"><button class="btn secondary" type="submit">${T('Verifică','Check')}</button></form><p class="fix-note">${T('Exersezi scrierea. Nu schimbă rezultatul rundei — cardul revine oricum la recapitulare.','You are practising writing. It does not change the round result — the card comes back for revision anyway.')}</p>`):''}<button class="btn ${s.result?'primary':'retry-btn'}" data-next>${T('Continuă','Continue')} ${icon('arrow')}</button>${canEdit()&&c?(editingCard===c.id?editForm(c):`<button class="btn secondary inline-edit-open" data-start-edit="${c.id}">${T('Corectează cardul','Fix the card')}</button>`):''}</div>`:'';
  shell(`<section class="game-wrap">${gameHeader()}<div class="challenge-card"><div class="challenge-kicker">${icon(q.drill?.dialog?'chat':q.type==='learn'?'layers':'spark')} ${label}</div><h1 class="question-title">${h(heading)}</h1>${prompt?`<div class="question-prompt ${q.type==='reverse'?'arabizi-prompt':''}" dir="ltr">${h(prompt)}</div>`:''}${c?.lang==='en'?`<div class="english-label">${T('EN · Sens în engleză','EN · English meaning')}</div>`:''}${body}${hint}${feedback}<div class="challenge-bottom"><span>${h(sourceLine(grammar?q.drill:c))}</span>${!s.answered&&q.type!=='learn'?`<button class="hint-button" data-hint ${s.hinted?'disabled':''}>${icon('info')} Un indiciu</button>`:''}</div></div><p class="game-keyboard">${q.type==='learn'?T('Descoperirea nu acordă XP. Câștigi puncte când îți amintești singur.','Discovering earns no XP. You score points when you remember on your own.'):q.type==='write'?T('Enter pentru verificare · fără limită de timp','Enter to check · no time limit'):T('Tastele 1–4 pentru răspuns · Enter pentru a continua','Keys 1–4 to answer · Enter to continue')}</p></section>`);
  if(q.type==='write'&&!s.answered)$('#typed-answer')?.focus({preventScroll:true});
 }
 function answer(value){const s=session;if(!s||s.answered||s.done)return;const q=s.questions[s.index];let correct=q.card&&['write','order'].includes(q.type)?E.accepts(q.card,value):E.exact(q.answer)===E.exact(value);
  s.answered=true;s.result=correct;s.selectedOption=value;s.typed=value;
  const earned=correct&&!s.hinted;
  state.progress=E.record(state.progress,q.id,correct,s.hinted);
  if(earned){s.streak++;const points=10+(s.streak%3===0?5:0);s.xp+=points;state.xp+=points;state.daily[day()]=(state.daily[day()]||0)+1;s.correct++;}
  else{s.streak=0;if(!s.misses.includes(q.id))s.misses.push(q.id);}
  save();renderGame();
 }
 /* There is deliberately no in-round retry: a missed card is not re-asked
    before the round ends. Scaffolding for one used to be here (a q.retry flag
    feeding an "ÎNCĂ O ȘANSĂ" badge and a guard that withheld the round point)
    but nothing ever set the flag, and it is removed rather than revived —
    reviving it breaks two rules at once.

    A round is exactly 20 items; verify-rounds asserts it with the message
    "Mistakes must not silently lengthen rounds". Appending a retry lengthens
    the round by definition.

    And E.record writes `wrong: !earned`, so answering a retry correctly clears
    the mistake flag — the card would drop straight out of "Reia greșelile",
    erasing the mistake the learner is supposed to come back to.

    tryFix below is what replaces it: write the answer again for practice,
    scoring and scheduling untouched. */
 function tryFix(value){const s=session;if(!s||!s.answered||s.result)return;
  const q=s.questions[s.index];
  const ok=q.card&&['write','order'].includes(q.type)?E.accepts(q.card,value):E.exact(q.answer)===E.exact(value);
  s.fixTyped=value;s.fixed=ok;
  if(!ok)toast(T('Încă nu. Uită-te la răspunsul de mai sus și încearcă din nou.','Not yet. Look at the answer above and try again.'));
  renderGame();
 }
 function next(){const s=session;if(!s||!s.answered)return;s.index++;if(s.index>=s.questions.length){finish();return;}s.answered=false;s.hinted=false;s.result=null;s.selectedOption=null;s.typed='';s.selectedTokens=[];s.revealed=false;s.fixTyped='';s.fixed=false;renderGame();}
 function finish(){if(!session||session.done)return;session.done=true;state.rounds++;save();renderGame();window.scrollTo({top:0});}
 function resultsScreen(){const s=session;const cardsMode=s.mode==='cards';const still=s.misses.filter(id=>state.progress[id]?.wrong).length;const ratio=s.correct/Math.max(1,s.initial);const stars=cardsMode?0:ratio>=.9?3:ratio>=.6?2:1;
  shell(`<section class="result-screen"><div class="result-icon">${icon(cardsMode?'book':'trophy')}</div><div class="eyebrow">${h(s.title)} · RUNDĂ ÎNCHEIATĂ</div><h1>${cardsMode?T('Cuvinte noi, curaj nou.','New words, new courage.'):ratio>=.9?T('Bravo! Ktiir mnii7!','Well done! Ktiir mnii7!'):ratio>=.6?T('Aventura merge mai departe!','The adventure continues!'):T('Ai făcut primul pas. Continuă!','You\'ve taken the first step. Keep going!')}</h1><p>${cardsMode?T('Acum testează ce îți amintești într-o misiune mixtă.','Now test what you remember in a mixed mission.'):T('Fiecare răspuns te apropie de conversație.','Every answer brings you closer to conversation.')}</p>${!cardsMode?`<div class="result-stars" aria-label="${stars} din 3 stele">${[1,2,3].map(n=>icon('star',n<=stars?'filled':'')).join('')}</div>`:''}<div class="result-stats"><div><strong>+${s.xp}</strong><span>${T('XP câștigate','XP earned')}</span></div><div><strong>${cardsMode?s.learned:s.correct}/${s.initial}</strong><span>${cardsMode?T('carduri parcurse','cards seen'):T('bune din prima, fără indiciu','right first time, no hint')}</span></div><div><strong>${still}</strong><span>${T('încă de exersat','still to practise')}</span></div></div>${still?`<div class="result-note">${T('Greșelile tale sunt păstrate în „Reia greșelile”. „Set nou” alege alte elemente. „Reia greșelile” se concentrează pe ce ai greșit și completează cu recapitulare până la 20.','Your mistakes are kept under “Redo your mistakes”. “New set” picks different items. “Redo your mistakes” focuses on what you got wrong and fills up to 20 with revision.')}</div>`:''}<div class="result-buttons"><button class="btn primary" data-play-unit="${s.unit}" data-mode="${cardsMode?'mix':s.mode}">${cardsMode?T('Testează ce ai învățat','Test what you\'ve learned'):T('Set nou · 20 de provocări','New set · 20 challenges')} ${icon('arrow')}</button><button class="btn secondary" data-nav="journey">Traseul meu</button>${still?'<button class="text-btn" data-review>Reia greșelile</button>':''}</div><div class="result-speak">${icon('chat')} ${T('Spune cu voce tare trei expresii pe care le-ai folosit.','Say out loud three phrases you used.')}</div></section>`);
 }
 function pairsScreen(){const s=session;if(s.done){resultsScreen();return;}shell(`<section class="game-wrap">${gameHeader()}<div class="challenge-card"><div class="challenge-kicker">${icon('layers')} GĂSEȘTE PERECHILE</div><h1 class="question-title">${T('Două limbi. Același sens.','Two languages. The same meaning.')}</h1><p class="pair-instruction">${T('Alege un cuvânt din stânga, apoi sensul din dreapta.','Pick a word on the left, then its meaning on the right.')}</p><div class="pair-columns"><div><h2>ARABIZI</h2>${s.left.map(c=>`<button class="pair-button ${s.matched.includes(c.id)?'matched':s.pairError?.includes('l'+c.id)?'pair-error':s.pairLeft===c.id?'pair-selected':''}" data-pair-left="${c.id}" ${s.matched.includes(c.id)||s.pairBusy?'disabled':''}>${h(c.ar)}${s.matched.includes(c.id)?icon('check'):''}</button>`).join('')}</div><div><h2>${s.right[0]?.lang==='en'?T('ENGLEZĂ','ENGLISH'):T('SENS','MEANING')}</h2>${s.right.map(c=>`<button class="pair-button ${s.matched.includes(c.id)?'matched':s.pairError?.includes('r'+c.id)?'pair-error':s.pairRight===c.id?'pair-selected':''}" data-pair-right="${c.id}" ${s.matched.includes(c.id)||s.pairBusy?'disabled':''}>${h(c.ro)}${s.matched.includes(c.id)?icon('check'):''}</button>`).join('')}</div></div><div class="pair-feedback" role="status">${s.pairError?T('Încă nu sunt pereche. Privește sensul și încearcă din nou.','Not a pair yet. Look at the meaning and try again.'):s.matched.length?'Mnii7! '+s.matched.length+T(' perechi găsite.',' pairs found.'):T('Le poți selecta și cu Tab, apoi Enter.','You can also select them with Tab, then Enter.')}</div></div></section>`);}
 function selectPair(side,id){const s=session;if(!s||s.mode!=='pairs'||s.pairBusy||s.matched.includes(id))return;s[side==='left'?'pairLeft':'pairRight']=id;
  if(s.pairLeft&&s.pairRight){const left=s.pairLeft,right=s.pairRight;if(left===right){s.matched.push(left);const hinted=s.pairWrong.has(left);state.progress=E.record(state.progress,left,true,hinted);if(!hinted){s.correct++;s.xp+=10;state.xp+=10;state.daily[day()]=(state.daily[day()]||0)+1;s.streak++;}s.pairLeft=null;s.pairRight=null;save();if(s.matched.length===s.left.length){s.pairCompleted+=s.left.length;if(s.pairCompleted===s.initial){finish();return;}s.boardOffset+=s.left.length;nextPairBoard();}}
  else{s.pairWrong.add(left);s.pairWrong.add(right);for(const v of [left,right]){state.progress=E.record(state.progress,v,false);if(!s.misses.includes(v))s.misses.push(v);}s.streak=0;s.pairError=['l'+left,'r'+right];s.pairBusy=true;save();const current=s;setTimeout(()=>{if(session!==current)return;s.pairLeft=null;s.pairRight=null;s.pairError=null;s.pairBusy=false;renderGame();},850);}}
  renderGame();
 }
 function learnCard(known){const s=session;if(!s||s.mode!=='cards'||!s.revealed)return;const q=s.questions[s.index];const p=state.progress[q.id]||{seen:0,correct:0,streak:0,wrong:false};state.progress[q.id]={...p,seen:p.seen+1,last:Date.now(),wrong:known?p.wrong:true};s.learned++;if(!known&&!s.misses.includes(q.id))s.misses.push(q.id);save();s.answered=true;next();}
 function showLeave(target='missions'){if(!session||session.done){session=null;view=target;render();return;}const dialog=document.createElement('dialog');dialog.className='leave-dialog';dialog.innerHTML=`<h2>${T('Închei runda aici?','End the round here?')}</h2><p>${T('Punctele și răspunsurile deja date sunt salvate. Runda neterminată nu primește o insignă.','The points and answers you have already given are saved. An unfinished round earns no badge.')}</p><div><button class="btn secondary" id="stay">Mai joc</button><button class="btn primary" id="leave">Revin la misiuni</button></div>`;document.body.append(dialog);dialog.showModal();dialog.querySelector('#stay').onclick=()=>{dialog.close();dialog.remove();};dialog.querySelector('#leave').onclick=()=>{dialog.close();dialog.remove();session=null;view=target;render();};dialog.addEventListener('cancel',()=>dialog.remove());}

 document.addEventListener('click',ev=>{const b=ev.target.closest('button,a');if(!b)return;
  if(b.dataset.nav){setView(b.dataset.nav);return;}
  if(b.dataset.group){group=b.dataset.group;missions();return;}
  if(b.dataset.unit){unitScreen(b.dataset.unit);window.scrollTo({top:0});return;}
  if(b.dataset.start){start(b.dataset.start,'mix');return;}
  if(b.dataset.study){start(b.dataset.study,'cards');return;}
  if(b.dataset.playUnit){start(b.dataset.playUnit,b.dataset.mode,b.dataset.playUnit==='review');return;}
  if(b.hasAttribute('data-due')){start(state.lastUnit||'a1-welcome','mix',false,true);return;}
  if(b.hasAttribute('data-review')){start('review','mix',true);return;}
  if(b.dataset.page!==undefined){lexPage=Number(b.dataset.page);collection();$('#main').scrollIntoView({behavior:'smooth'});return;}
  if(b.hasAttribute('data-leave')){showLeave();return;}
  // Above the round-only guard below: correcting happens in the word browser
  // too, where there is no session, and anything after that early return only
  // ever fires mid-round.
  if(b.dataset.startEdit){startEdit(b.dataset.startEdit);return;}
  if(b.hasAttribute('data-cancel-edit')){cancelEdit();return;}
  if(!session||session.done)return;
  const q=session.questions?.[session.index];
  if(b.dataset.answerIndex!==undefined){answer(q.options[Number(b.dataset.answerIndex)]);return;}
  if(b.hasAttribute('data-next')){next();return;}
  if(b.hasAttribute('data-hint')){if(q.type==='write')session.typed=$('#typed-answer')?.value||'';session.hinted=true;renderGame();return;}
  if(b.dataset.token!==undefined){session.selectedTokens.push(Number(b.dataset.token));renderGame();return;}
  if(b.dataset.removeToken!==undefined){session.selectedTokens=session.selectedTokens.filter(i=>i!==Number(b.dataset.removeToken));renderGame();return;}
  if(b.hasAttribute('data-check-order')){answer(session.selectedTokens.map(id=>q.tokens.find(t=>t.id===id).text).join(' '));return;}
  if(b.hasAttribute('data-flip')){session.revealed=!session.revealed;renderGame();return;}
  if(b.dataset.learn){learnCard(b.dataset.learn==='known');return;}
  if(b.dataset.pairLeft){selectPair('left',b.dataset.pairLeft);return;}
  if(b.dataset.pairRight){selectPair('right',b.dataset.pairRight);return;}
 });
 document.addEventListener('submit',ev=>{if(ev.target.id==='write-form'){ev.preventDefault();const val=$('#typed-answer').value.trim();if(val)answer(val);else toast(T('Scrie un răspuns înainte de verificare.','Type an answer before checking.'));}if(ev.target.dataset&&ev.target.dataset.editForm){ev.preventDefault();const f=new FormData(ev.target);
    saveEdit(ev.target.dataset.editForm,String(f.get('ar')||'').trim(),String(f.get('ro')||'').trim(),String(f.get('variants')||'').split(',').map(x=>x.trim()).filter(Boolean));return;}
   if(ev.target.id==='fix-form'){ev.preventDefault();const val=$('#fix-answer').value.trim();if(val)tryFix(val);else toast(T('Scrie răspunsul corect ca să exersezi.','Type the correct answer to practise it.'));}});
 let searchTimer;
 document.addEventListener('input',ev=>{if(ev.target.id==='word-search'){lexQuery=ev.target.value;lexPage=0;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const pos=$('#word-search')?.selectionStart;collection();const input=$('#word-search');input?.focus({preventScroll:true});try{input?.setSelectionRange(pos,pos);}catch{}},220);}});
 document.addEventListener('change',ev=>{if(ev.target.id==='training-group'){trainingLevel=ev.target.value;training();return;}if(ev.target.id==='unit-filter'){lexUnit=ev.target.value;lexPage=0;collection();}});
 document.addEventListener('keydown',ev=>{if(!session||session.done||document.querySelector('dialog[open]'))return;if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(ev.target.tagName))return;
  if(session.answered&&ev.key==='Enter'){ev.preventDefault();next();return;}
  const q=session.questions?.[session.index];if(!session.answered&&q?.options&&/^[1-4]$/.test(ev.key)){const opt=q.options[Number(ev.key)-1];if(opt){ev.preventDefault();answer(opt);}}
 });
 window.YallaPlus.init({shell,h,icon,state,save,toast});
 window.YallaTransfer?.init({state,go:setView,toast});
 window.YallaAcademy.init({shell,h,icon,state,save,toast,go:setView});
 const entry=new URLSearchParams(window.location?.search||'').get('view');
 if(['adventure','placement','journey','teacher','exports','speaking','missions'].includes(entry))view=entry;
 render();
})();
