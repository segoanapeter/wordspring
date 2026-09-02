// Mapula — WordSpring learning guide. Introduces each activity before Exercise 1.
(function(){
const guides={
 sentence:{icon:'✍️',title:'Sentence Studio',goal:'Today we are going to turn ideas into complete sentences.',tip:'Start with a capital letter, put the words in a clear order, and finish with the correct punctuation.',motivation:'Take your time. A strong writer grows one sentence at a time!'},
 reading:{icon:'📖',title:'Read & Understand',goal:'Today we will read carefully, understand the passage, and answer questions using clues from the text.',tip:'Read the question carefully, then look back at the passage before choosing your answer.',motivation:'Great readers are clue detectives. You can do this!'},
 speech:{icon:'🎙️',title:'Pronunciation Lab',goal:'Today we will listen to words, notice their sounds and syllables, and practise saying them clearly.',tip:'Listen first, then say the word slowly. Repeat it until it feels comfortable.',motivation:'Your voice gets stronger every time you practise!'},
 words:{icon:'🌱',title:'Word Garden',goal:'Today we are growing our vocabulary by learning new words and what they mean.',tip:'Listen to the word, read its meaning, and think about how you could use it in a sentence.',motivation:'Every new word you learn makes your Word Garden grow!'},
 grammar:{icon:'🧩',title:'Grammar Detective',goal:'Today we will find and fix language clues in sentences.',tip:'Look carefully at capital letters, punctuation, word forms and how the words work together.',motivation:'Put on your detective hat. You are ready to solve the clues!'},
 quest:{icon:'🏆',title:'Daily Quest',goal:'Now it is time to use the reading, writing, vocabulary and grammar skills you have been practising.',tip:'Do not rush. Read every question and think before choosing your answer.',motivation:'Do your best, not someone else’s best. Let’s earn that trophy!'}
};
let baseOpen=window.openLesson;
if(typeof baseOpen!=='function') return;
let pending=null;
function gradeLabel(){return (window.gradeNames&&gradeNames[level])||String(level||'').replace('grade','Grade ');}
function introText(type){const g=guides[type];return `Hi! I'm Mapula, your WordSpring learning buddy. Welcome to ${g.title}. ${g.goal} Here's my tip: ${g.tip} ${g.motivation}`;}

// Mapula should sound youthful, bright and South African. Browser voices vary by device,
// so prefer a female en-ZA voice and avoid obviously mature/narrator voices where possible.
function mapulaVoice(){
 const voices=speechSynthesis.getVoices();
 if(!voices.length) return null;
 const femaleHints=/female|woman|girl|lebo|thando|zanele|ayanda|naledi|lindi|samantha|tessa|zira/i;
 const matureHints=/male|man|david|mark|george|daniel|narrator|grandma|grandmother/i;
 const score=v=>{
   const name=(v.name||''); const lang=(v.lang||'').toLowerCase(); let s=0;
   if(lang==='en-za') s+=100;
   else if(lang.startsWith('en-za')) s+=90;
   else if(lang==='en-gb') s+=35;
   else if(lang.startsWith('en')) s+=20;
   if(/south africa|south african/i.test(name)) s+=60;
   if(femaleHints.test(name)) s+=25;
   if(matureHints.test(name)) s-=30;
   return s;
 };
 return voices.filter(v=>(v.lang||'').toLowerCase().startsWith('en')).sort((a,b)=>score(b)-score(a))[0]||voices[0];
}
function speakMapula(text){
 if(!('speechSynthesis' in window)) return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 const v=mapulaVoice();
 if(v){u.voice=v;u.lang=v.lang||'en-ZA';} else u.lang='en-ZA';
 // Slightly raised pitch and natural conversational pace to make Mapula sound younger.
 u.pitch=1.32;
 u.rate=1.02;
 u.volume=1;
 speechSynthesis.speak(u);
}
window.mapulaSpeak=function(type){
 const text=introText(type);
 const go=()=>speakMapula(text);
 if(speechSynthesis.getVoices().length) go();
 else {speechSynthesis.addEventListener('voiceschanged',go,{once:true});setTimeout(go,700);}
};
function show(type){
 const g=guides[type]; if(!g){baseOpen(type);return;}
 pending=type;
 const lesson=document.getElementById('lesson');
 lesson.innerHTML=`<div class="mapula-intro"><div class="mapula-avatar" aria-hidden="true"><div class="mapula-face">👧🏾</div><div class="mapula-name">Mapula</div><small>Your learning buddy</small></div><div class="mapula-message"><span class="mapula-kicker">${gradeLabel()} • ${g.icon} ${g.title}</span><h2>Hi! I’m Mapula 👋</h2><p>${g.goal}</p><div class="mapula-tip"><b>💡 Mapula’s tip</b><span>${g.tip}</span></div><p class="mapula-motivation">🌟 ${g.motivation}</p><div class="mapula-actions"><button type="button" class="secondary" onclick="mapulaSpeak('${type}')">🔊 Hear Mapula</button><button type="button" class="action" onclick="mapulaStart()">Start Exercise 1 →</button></div></div></div>`;
 setTimeout(()=>window.mapulaSpeak(type),300);
}
window.mapulaStart=function(){if(!pending)return;const t=pending;pending=null;baseOpen(t,0);};
window.openLesson=function(type,index=0){
 if(index===0 && guides[type]){show(type);return;}
 return baseOpen(type,index);
};
})();