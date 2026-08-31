// WordSpring adaptive learning recommendations.
(function(){
const types=['sentence','reading','speech','words','grammar','quest'];
const names={sentence:'Sentence Studio',reading:'Read & Understand',speech:'Pronunciation Lab',words:'Word Garden',grammar:'Grammar Detective',quest:'Daily Quest'};
const icons={sentence:'✍️',reading:'📖',speech:'🎙️',words:'🌱',grammar:'🧩',quest:'🏆'};
function statsFor(type){try{const s=stat(type)||{};const attempts=Number(s.attempts||s.completed||0),correct=Number(s.correct||0);return {attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):null};}catch(e){return {attempts:0,correct:0,accuracy:null};}}
function nextSkill(){const rows=types.map(type=>({type,...statsFor(type)}));const fresh=rows.find(r=>r.attempts===0);if(fresh)return fresh;return rows.sort((a,b)=>a.accuracy-b.accuracy)[0];}
function render(){const grid=document.querySelector('.grid');if(!grid)return;let box=document.getElementById('learningPath');if(!box){box=document.createElement('section');box.id='learningPath';box.className='learning-path';grid.insertAdjacentElement('beforebegin',box);}const r=nextSkill();const reason=r.accuracy===null?'This activity has not been practised yet.':'Current accuracy: '+r.accuracy+'%. Practise this skill next.';box.innerHTML='<div class="path-head"><div><small>RECOMMENDED NEXT</small><h2>'+icons[r.type]+' '+names[r.type]+'</h2><p>'+reason+'</p></div><button type="button" class="action" id="recommendedStart">Start activity</button></div><div class="mastery-grid">'+types.map(t=>{const s=statsFor(t);return '<div class="mastery-row"><span>'+icons[t]+' '+names[t]+'</span><b>'+(s.accuracy===null?'—':s.accuracy+'%')+'</b></div>';}).join('')+'</div>';document.getElementById('recommendedStart').onclick=()=>openLesson(r.type);}
const oldRecord=window.record;if(oldRecord)window.record=function(ok){const x=oldRecord(ok);setTimeout(render,0);return x;};
const oldLevel=window.changeLevel;window.changeLevel=function(v){if(oldLevel)oldLevel(v);setTimeout(render,0);};
const oldTerm=window.changeTerm;if(oldTerm)window.changeTerm=function(v){oldTerm(v);setTimeout(render,0);};
window.refreshLearningPath=render;setTimeout(render,0);
})();