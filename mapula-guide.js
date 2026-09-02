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

// Mapula must use a true South African English system voice. We deliberately do NOT
// fall back to US/GB English because that changes her character and accent.
function mapulaVoice(){
 const voices=speechSynthesis.getVoices();
 if(!voices.length) return null;
 const za=voices.filter(v=>{
   const lang=(v.lang||'').toLowerCase();
   const name=v.name||'';
   return lang==='en-za' || lang.startsWith('en-za') || /south africa|south african/i.test(name);
 });
 if(!za.length) return null;
 const femaleHints=/female|woman|girl|ayanda|leah|zanele|naledi|lindi|thando|lerato|mapula/i;
 const naturalHints=/natural|neural|online|premium/i;
 const score=v=>{
   const name=v.name||''; let s=0;
   if((v.lang||'').toLowerCase()==='en-za') s+=100;
   if(/south africa|south african/i.test(name)) s+=50;
   if(femaleHints.test(name)) s+=30;
   if(naturalHints.test(name)) s+=15;
   if(/male|man|david|mark|george|daniel|narrator/i.test(name)) s-=40;
   return s;
 };
 return za.sort((a,b)=>score(b)-score(a))[0];
}
function voiceFeedback(message){
 const lesson=document.getElementById('lesson');
 if(!lesson) return;
 let box=lesson.querySelector('.mapula-voice-status');
 if(!box){box=document.createElement('div');box.className='mapula-voice-status tip';const actions=lesson.querySelector('.mapula-actions');if(actions)actions.after(box);}
 box.textContent=message;
}
function speakMapula(text){
 if(!('speechSynthesis' in window)){voiceFeedback('Mapula voice is not supported in this browser.');return;}
 const v=mapulaVoice();
 if(!v){voiceFeedback('A South African English voice is not installed on this device yet. WordSpring will not use an American voice for Mapula.');return;}
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.voice=v;
 u.lang='en-ZA';
 // Brighter, younger delivery while keeping the South African voice model.
 u.pitch=1.22;
 u.rate=.98;
 u.volume=1;
 voiceFeedback(`Mapula voice: ${v.name}`);
 speechSynthesis.speak(u);
}
window.mapulaSpeak=function(type){
 const text=introText(type);
 const go=()=>speakMapula(text);
 if(speechSynthesis.getVoices().length) go();
 else {speechSynthesis.addEventListener('voiceschanged',go,{once:true});setTimeout(go,900);}
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