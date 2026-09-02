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
window.mapulaSpeak=function(type){
 const text=introText(type);
 if(typeof window.speak==='function') window.speak(text); else if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-ZA';u.rate=.88;speechSynthesis.speak(u);}
};
function show(type){
 const g=guides[type]; if(!g){baseOpen(type);return;}
 pending=type;
 const lesson=document.getElementById('lesson');
 lesson.innerHTML=`<div class="mapula-intro"><div class="mapula-avatar" aria-hidden="true"><div class="mapula-face">👧🏾</div><div class="mapula-name">Mapula</div><small>Your learning buddy</small></div><div class="mapula-message"><span class="mapula-kicker">${gradeLabel()} • ${g.icon} ${g.title}</span><h2>Hi! I’m Mapula 👋</h2><p>${g.goal}</p><div class="mapula-tip"><b>💡 Mapula’s tip</b><span>${g.tip}</span></div><p class="mapula-motivation">🌟 ${g.motivation}</p><div class="mapula-actions"><button type="button" class="secondary" onclick="mapulaSpeak('${type}')">🔊 Hear Mapula</button><button type="button" class="action" onclick="mapulaStart()">Start Exercise 1 →</button></div></div></div>`;
 setTimeout(()=>window.mapulaSpeak(type),250);
}
window.mapulaStart=function(){if(!pending)return;const t=pending;pending=null;baseOpen(t,0);};
window.openLesson=function(type,index=0){
 // Show Mapula only when a learner enters an activity from the beginning.
 if(index===0 && guides[type]){show(type);return;}
 return baseOpen(type,index);
};
})();