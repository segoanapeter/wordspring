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

function voiceFeedback(message){
 const lesson=document.getElementById('lesson');
 if(!lesson) return;
 let box=lesson.querySelector('.mapula-voice-status');
 if(!box){box=document.createElement('div');box.className='mapula-voice-status tip';const actions=lesson.querySelector('.mapula-actions');if(actions)actions.after(box);}
 box.textContent=message;
}

// Prefer South African English, but always keep Mapula audible.
// If a true en-ZA voice is unavailable, use the closest English female voice and clearly label it as temporary.
function chooseMapulaVoice(){
 const voices=window.speechSynthesis ? speechSynthesis.getVoices() : [];
 if(!voices.length) return {voice:null,isZA:false};
 const femaleHints=/female|woman|girl|ayanda|leah|zanele|naledi|lindi|thando|lerato|samantha|zira|tessa|aria|sonia/i;
 const maleHints=/male|man|david|mark|george|daniel|guy|ryan|narrator/i;
 const naturalHints=/natural|neural|online|premium/i;
 const score=v=>{
   const name=v.name||'';
   const lang=(v.lang||'').toLowerCase();
   let s=0;
   if(lang==='en-za') s+=1000;
   else if(lang.startsWith('en-za')) s+=900;
   else if(/south africa|south african/i.test(name)) s+=800;
   else if(lang==='en-gb') s+=350;
   else if(lang.startsWith('en-gb')) s+=320;
   else if(lang==='en-au') s+=280;
   else if(lang.startsWith('en-au')) s+=260;
   else if(lang.startsWith('en')) s+=120;
   if(femaleHints.test(name)) s+=90;
   if(naturalHints.test(name)) s+=30;
   if(maleHints.test(name)) s-=120;
   return s;
 };
 const english=voices.filter(v=>(v.lang||'').toLowerCase().startsWith('en'));
 const pool=english.length?english:voices;
 const voice=pool.slice().sort((a,b)=>score(b)-score(a))[0]||null;
 const isZA=!!voice && (((voice.lang||'').toLowerCase().startsWith('en-za')) || /south africa|south african/i.test(voice.name||''));
 return {voice,isZA};
}

function speakMapula(text){
 if(!('speechSynthesis' in window)){voiceFeedback('Voice is not supported in this browser.');return;}
 const picked=chooseMapulaVoice();
 const u=new SpeechSynthesisUtterance(text);
 if(picked.voice){u.voice=picked.voice;u.lang=picked.voice.lang||'en-ZA';}
 else u.lang='en-ZA';
 u.pitch=1.16;
 u.rate=.96;
 u.volume=1;
 u.onstart=()=>voiceFeedback(picked.isZA ? `Mapula voice: ${picked.voice.name}` : 'Mapula is speaking with a temporary device voice while we add her dedicated South African voice.');
 u.onerror=()=>voiceFeedback('Mapula could not play the voice. Please press Hear Mapula again.');
 speechSynthesis.cancel();
 if(typeof speechSynthesis.resume==='function') speechSynthesis.resume();
 setTimeout(()=>speechSynthesis.speak(u),120);
}

window.mapulaSpeak=function(type){
 const text=introText(type);
 if(!('speechSynthesis' in window)){voiceFeedback('Voice is not supported in this browser.');return;}
 const start=()=>speakMapula(text);
 if(speechSynthesis.getVoices().length){start();return;}
 let played=false;
 const once=()=>{if(played)return;played=true;start();};
 speechSynthesis.addEventListener('voiceschanged',once,{once:true});
 setTimeout(once,1000);
};

function show(type){
 const g=guides[type]; if(!g){baseOpen(type);return;}
 pending=type;
 const lesson=document.getElementById('lesson');
 lesson.innerHTML=`<div class="mapula-intro"><div class="mapula-avatar" aria-hidden="true"><div class="mapula-face">👧🏾</div><div class="mapula-name">Mapula</div><small>Your learning buddy</small></div><div class="mapula-message"><span class="mapula-kicker">${gradeLabel()} • ${g.icon} ${g.title}</span><h2>Hi! I’m Mapula 👋</h2><p>${g.goal}</p><div class="mapula-tip"><b>💡 Mapula’s tip</b><span>${g.tip}</span></div><p class="mapula-motivation">🌟 ${g.motivation}</p><div class="mapula-actions"><button type="button" class="secondary" onclick="mapulaSpeak('${type}')">🔊 Hear Mapula</button><button type="button" class="action" onclick="mapulaStart()">Start Exercise 1 →</button></div></div></div>`;
}
window.mapulaStart=function(){if(!pending)return;const t=pending;pending=null;baseOpen(t,0);};
window.openLesson=function(type,index=0){
 if(index===0 && guides[type]){show(type);return;}
 return baseOpen(type,index);
};
})();