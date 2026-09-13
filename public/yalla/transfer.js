/* Portable local progress; no network transfers or accounts. */
(function(root){'use strict';
let api;
const key='yalla-liban-progress-v1',ids=new Set([...root.YALLA.cards,...root.YALLA.drills].map(c=>c.id));
function validate(v){
 if(v?.format!=='yalla-progress-v1'||!v.state||typeof v.state.progress!=='object'||Array.isArray(v.state.progress))throw Error('Fișier de progres invalid.');
 const p={},numeric=['seen','correct','streak','last','reviewStage','dueAt'];
 for(const [id,x] of Object.entries(v.state.progress)){if(!ids.has(id))continue;if(!x||typeof x!=='object')throw Error('Progres invalid.');const c={};for(const f of numeric)if(x[f]!==undefined){if(!Number.isFinite(x[f])||x[f]<0)throw Error('Valoare de progres invalidă.');c[f]=x[f];}c.wrong=!!x.wrong;p[id]=c;}
 const out={progress:p};for(const f of ['xp','rounds']){if(!Number.isFinite(v.state[f])||v.state[f]<0)throw Error('Scor invalid.');out[f]=v.state[f];}
 if(root.YALLA.units.some(u=>u.id===root.YallaCurriculum.resolve(v.state.lastUnit)))out.lastUnit=root.YallaCurriculum.resolve(v.state.lastUnit);
 if(root.YallaCurriculum.levels.some(l=>l.id===v.state.learningTrack))out.learningTrack=v.state.learningTrack;
 out.daily={};for(const [d,n] of Object.entries(v.state.daily||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(n)&&n>=0)out.daily[d]=n;
 return out;
}
function importProgress(value){const incoming=validate(value),next={...api.state,progress:{...api.state.progress},daily:{...api.state.daily},xp:Math.max(api.state.xp,incoming.xp),rounds:Math.max(api.state.rounds,incoming.rounds)};
 for(const [id,p] of Object.entries(incoming.progress)){const old=next.progress[id];if(!old||(p.last||0)>(old.last||0)||(p.last||0)===(old.last||0)&&(p.seen||0)>(old.seen||0))next.progress[id]=p;}
 for(const [d,n] of Object.entries(incoming.daily))next.daily[d]=Math.max(next.daily[d]||0,n);
 if(incoming.lastUnit)next.lastUnit=incoming.lastUnit;if(incoming.learningTrack)next.learningTrack=incoming.learningTrack;
 localStorage.setItem(key,JSON.stringify(next));Object.assign(api.state,next);return Object.keys(incoming.progress).length;
}
function data(){return {format:'yalla-progress-v1',exportedAt:new Date().toISOString(),state:{progress:api.state.progress,xp:api.state.xp,rounds:api.state.rounds,daily:api.state.daily,lastUnit:api.state.lastUnit,learningTrack:api.state.learningTrack}};}
function controls(){return '<details class="teacher-panel"><summary>Mută progresul pe alt dispozitiv sau website</summary><p>Descarcă progresul aici, apoi încarcă fișierul în noul joc. Se păstrează răspunsul cel mai recent pentru fiecare element. Corecturile profesorului și temele se transferă separat din atelier.</p><button class="btn secondary" data-progress-export>Descarcă progresul</button> <label class="file-action">Încarcă progresul<input id="progress-import" type="file" accept=".json,application/json"></label></details>';}
document.addEventListener('click',ev=>{if(!ev.target.closest?.('[data-progress-export]'))return;const u=URL.createObjectURL(new Blob([JSON.stringify(data(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='Yalla-progres.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
document.addEventListener('change',async ev=>{if(ev.target.id!=='progress-import')return;try{const f=ev.target.files?.[0];if(!f)return;if(f.size>3000000)throw Error('Fișier prea mare.');const n=importProgress(JSON.parse(await f.text()));api.go('journey');api.toast('Progres încărcat: '+n+' elemente.');}catch(e){api.toast(e.message||'Import nereușit.');}ev.target.value='';});
root.YallaTransfer={init:a=>api=a,validate,importProgress,data,controls};
})(window);
