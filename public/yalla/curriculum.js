/* Editorial teaching sequence based on Plan_Curs_Araba_Libaneza_A1-C2.
   Source units remain in sourceUnits; card/drill IDs never change. */
(function(root){
'use strict';
const D=root.YALLA,sourceUnits=D.units.map(u=>({...u})),map={},units=[];
function lesson(id,group,title,desc,icon,origins,tips=[]){
 const ids=origins.split(' ');
 for(const old of ids){if(map[old]||!sourceUnits.some(u=>u.id===old))throw Error('Invalid curriculum mapping: '+old);map[old]=id;}
 units.push({id,group,title,desc,icon,origins:ids,tips:tips.length?tips:['Descoperă expresiile, apoi verifică ce îți amintești fără ajutor.','Spune o propoziție proprie folosind cuvintele din lecție.']});
}
lesson('a1-welcome','A1','Salută și prezintă-te','Începe o conversație, spune-ți numele și descifrează Arabizi.','sun','l1 m1 w-sounds w-greetings guide-1 plan-1',['2, 3, 5, 7 și 8 reprezintă sunete. 5 poate apărea și ca kh, iar 8 ca gh.','Alege formula potrivită pentru salut, prezentare și rămas-bun.']);
lesson('a1-questions','A1','Întreabă și spune ce vrei','Cine, ce, unde și cum? Vorbește despre tine și interlocutor.','chat','l2 m2 w-pronouns w-want plan-15');
lesson('a1-family','A1','Familia și lucrurile mele','Prezintă familia și spune cui îi aparține un lucru.','home','l3 m3 w-dual guide-2 plan-3');
lesson('a1-home','A1','Acasă','Descrie camerele, mobilierul și obiectele din jur.','home','m5 d4 d5 d6 d7 plan-6');
lesson('a1-description','A1','Culori și descrieri','Descrie persoane și obiecte folosind articolul și acordul.','palette','w-article d14 m11 plan-16');
lesson('a1-numbers','A1','Numără și cere','Folosește numere, cantități și numere de telefon.','tag','m6 w-numbers plan-2');
lesson('a1-time','A1','Zile, ore și date','Spune când se întâmplă ceva și citește ora.','sun','m7 w-days w-time plan-14');
lesson('a1-meeting','A1','Stabilește o întâlnire','Propune o zi și o oră, acceptă sau schimbă planul.','chat','m8 m9');
lesson('a1-weather','A1','Vremea și anotimpurile','Vorbește despre vreme, luni și schimbările din natură.','leaf','m10 m12 plan-11');
lesson('a1-needs','A1','Am, vreau, pot','Spune ce ai, ce poți face și de ce ai nevoie.','spark','l4 m4');
lesson('a1-actions','A1','Ce faci acum?','Începe să folosești verbele la prezent și trecut în propoziții scurte.','bolt','m13 guide-8 plan-5');
lesson('a1-restaurant','A1','La restaurant','Cere o masă, comandă mâncare și răspunde chelnerului.','cup','m14 m15 guide-4 plan-4 plan-18');
lesson('a1-city','A1','Găsește drumul','Cere direcții, recunoaște locurile și folosește transportul.','map','guide-6 d20 d22 d23 plan-8 plan-22');
lesson('a1-shopping','A1','La cumpărături','Întreabă prețul și cere fructe, legume sau alte produse.','bag','guide-7 d12 d13 plan-7 plan-21');
lesson('a1-clothes','A1','Haine și aspect','Alege haine și descrie cum arată cineva.','tag','d8 plan-12');
lesson('a1-health','A1','Corpul și sănătatea','Numește părțile corpului și spune cum te simți.','drop','plan-13 plan-20');
lesson('a1-work','A1','Munca și studiile','Spune cu ce te ocupi și vorbește despre o zi de lucru.','bag','m19 guide-3 d26 plan-9');
lesson('a1-leisure','A1','Timpul liber','Vorbește despre hobby-uri, sport și muzică.','music','d15 d16 d24 d25 plan-10 plan-23');
lesson('a1-plans','A1','Planuri și sărbători','Spune ce vei face, pregătește o ieșire și urează cuiva de bine.','gift','m17 d17 guide-14 plan-17 plan-19');
lesson('a1-daily','A1','Ziua mea','Leagă activitățile zilnice de nevoi, locuri și momente.','sun','m18 m20 w-words');
lesson('a1-polite','A1','Cere politicos','Alege o formulă de politețe potrivită situației.','chat','m21');
lesson('a1-frequency','A1','Relații, ordine și frecvență','Vorbește despre rude și spune cât de des faci ceva.','layers','m23');
lesson('a1-review','A1','Pune totul împreună','Aplică întrebările, posesivele și expresiile în situații de zi cu zi.','trophy','practice mrev1 mrev2 plan-24');
lesson('a2-roots','A2','De la rădăcină la expresie','Recunoaște familiile de cuvinte și folosește-le în întrebări.','leaf','w-roots m16');
lesson('a2-verbs','A2','Verbe pentru fiecare persoană','Consolidează formele verbale la prezent, trecut și viitor.','bolt','conj-akl conj-drs conj-3rf conj-3ml conj-sht8l conj-swe conj-tlfn');
lesson('a2-weak','A2','Verbe cu forme speciale','Exersează a vorbi, a da și a spune la toate persoanele.','pen','conj-7ki/7ke conj-3ti conj-2el/2ul');
lesson('a2-past','A2','Ce s-a întâmplat?','Reia trecutul și participiile pentru a vorbi despre acțiuni și stări.','compass','guide-9 w-participles');
lesson('a2-opinions','A2','Preferințe și opinii','Spune ce preferi, compară și formulează o opinie simplă.','chat','guide-11');
lesson('a2-modals','A2','Obligații și posibilități','Spune ce trebuie, ce este permis și ce se poate face.','flag','guide-12');
lesson('a2-connections','A2','Condiții și legături între idei','Exersează relativele, condițiile și ipotezele, cu recapitulări de acord.','layers','extra guide-13',['Yalle leagă o relativă de un substantiv hotărât.','Eza introduce o condiție posibilă; law poate introduce o ipoteză. Formele complexe se aprofundează ulterior.']);
lesson('v-nature','Vocabular','Natura și viețuitoarele','Extinde vocabularul despre animale, insecte și mare.','leaf','d9 d10 d11');
lesson('v-school','Vocabular','La școală','Obiecte și locuri pentru învățare și viața în clasă.','book','d18 d19');
lesson('v-port','Vocabular','În port','Explorează vocabularul legat de port.','anchor','d21');
for(let n=27;n<=37;n++){const u=sourceUnits.find(u=>u.id==='v'+n);lesson('v-index-'+n,'Vocabular','Cuvinte și acțiuni · '+(n-26),'Descoperă sensul în română și exersează expresia în Arabizi.','book',u.id);}
if(sourceUnits.some(u=>!map[u.id]))throw Error('Some source units have no curriculum destination');
for(const c of [...D.cards,...D.drills]){c.sourceUnit=c.unit;c.unit=map[c.unit];}
D.sourceUnits=sourceUnits;D.units=units;
const levels=[
 {id:'A1',title:'Primele conversații',status:'Jocuri disponibile',desc:'De la primul salut la situațiile de zi cu zi.'},
 {id:'A2',title:'Mai multă independență',status:'Consolidare disponibilă',desc:'Verbe, experiențe, opinii și idei legate între ele. Jocurile acoperă o parte din acest nivel.'},
 {id:'B1',title:'Explică și argumentează',status:'În pregătire',desc:'Următorul pas: conversații mai lungi și exprimarea ideilor.',topics:['Forme verbale derivate și vorbire indirectă','Condiții și subordonate complexe','Argumente, rezumate și conversații de 3–5 minute']},
 {id:'B2',title:'Conversează cu nuanță',status:'În pregătire',desc:'Adaptează-ți exprimarea la situație și interlocutor.',topics:['Registru, nuanțe și conectori','Negociere și discurs spontan','Media, cultură și variație regională']},
 {id:'C1',title:'Înțelege dincolo de cuvinte',status:'În pregătire',desc:'Explorează sensul implicit, umorul și exprimarea avansată.',topics:['Ironie, idiomuri și referințe culturale','Retorică, media și conversație profesională','Opțional: trecerea de la Arabizi la scrierea arabă']},
 {id:'C2',title:'Exprimă-te cu precizie',status:'În pregătire',desc:'Aprofundează domeniile și registrele care te interesează.',topics:['Specializări: economie, drept, sănătate și tehnologie','Analiză, dezbatere și sinteză','Proiecte personale și discurs interdisciplinar']},
 {id:'Vocabular',title:'Explorează cuvinte',status:'Practică suplimentară',desc:'O colecție deschisă tuturor nivelurilor; nu stabilește dificultatea CEFR.'}
];
function resolve(id){return map[id]||id;}
function migrate(state){state.lastUnit=resolve(state.lastUnit||'l1');if(state.assignment?.units)state.assignment.units=[...new Set(state.assignment.units.map(resolve))];if(state.placementResult?.unit)state.placementResult.unit=resolve(state.placementResult.unit);if(!levels.some(l=>l.id===state.learningTrack)){const old=sourceUnits.find(u=>u.group===state.learningTrack);state.learningTrack=units.find(u=>u.id===resolve(old?.id))?.group||'A1';}}
root.YallaCurriculum={levels,resolve,migrate,map};
})(window);
