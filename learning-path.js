// WordSpring cloud-first guided learning.
(function(){
const types=['sentence','reading','speech','words','grammar','quest'];
const names={sentence:'Sentence Studio',reading:'Read & Understand',speech:'Pronunciation Lab',words:'Word Garden',grammar:'Grammar Detective',quest:'Daily Quest'};
const icons={sentence:'✍️',reading:'📖',speech:'🎙️',words:'🌱',grammar:'🧩',quest:'🏆'};
let cloudStats=null;

function localStats(type){
  try{
    const s=stat(type)||{}, attempts=Number(s.attempts||s.completed||0), correct=Number(s.correct||0), done=Number(s.completed||0);
    return {attempts,correct,done,accuracy:attempts?Math.round(correct/attempts*100):null};
  }catch(e){return {attempts:0,correct:0,done:0,accuracy:null};}
}
function statsFor(type){
  const s=cloudStats&&cloudStats.by&&cloudStats.by[type];
  if(!s)return localStats(type);
  const attempts=Number(s.attempts||0), correct=Number(s.correct||0), done=Number(s.done||0);
  return {attempts,correct,done,accuracy:attempts?Math.round(correct/attempts*100):null};
}
function nextSkill(){
  const rows=types.map(type=>({type,...statsFor(type)}));
  const fresh=rows.find(r=>r.attempts===0);
  if(fresh)return fresh;
  const weakest=rows.slice().sort((a,b)=>a.accuracy-b.accuracy)[0];
  if(weakest&&weakest.accuracy>=80)return {...statsFor('quest'),type:'quest'};
  return weakest||{type:'reading',attempts:0,correct:0,done:0,accuracy:null};
}
function nextIndex(type){
  const done=statsFor(type).done;
  try{const count=banks[level][type].length;return count?done%count:0}catch(e){return 0}
}
function start(type){
  const chosen=type||nextSkill().type;
  openLesson(chosen,nextIndex(chosen));
  const target=document.getElementById('lesson'), head=target&&target.querySelector('.exercise-head');
  if(head){
    const note=document.createElement('div');
    note.className='tip guided-note';
    note.textContent='👧🏾 Mapula chose this practice for you. Finish it and I’ll use your result to choose what comes next.';
    head.insertAdjacentElement('afterend',note);
  }
}
function render(){
  const grid=document.querySelector('.grid');if(!grid)return;
  let box=document.getElementById('learningPath');
  if(!box){box=document.createElement('section');box.id='learningPath';box.className='learning-path';grid.insertAdjacentElement('beforebegin',box);}
  const r=nextSkill(), source=cloudStats?'Learner profile':'This device';
  let reason='This skill has not been practised yet. Mapula recommends trying it next.';
  if(r.accuracy!==null)reason=r.accuracy>=80&&r.type==='quest'?'Your skills are growing strongly. Mix them together in a Daily Quest.':'Current accuracy: '+r.accuracy+'%. Focused practice here can make the biggest difference.';
  box.innerHTML='<div class="path-head"><div><small>MAPULA • CONTINUE LEARNING</small><h2>'+icons[r.type]+' '+names[r.type]+'</h2><p>'+reason+'</p><span class="path-source">Based on: '+source+'</span></div><button type="button" class="action" id="recommendedStart">Continue learning →</button></div><div class="mastery-grid">'+types.map(t=>{const s=statsFor(t);return '<div class="mastery-row"><span>'+icons[t]+' '+names[t]+'</span><b>'+(s.accuracy===null?'—':s.accuracy+'%')+'</b></div>';}).join('')+'</div>';
  document.getElementById('recommendedStart').onclick=function(){start(r.type);};
}

const oldLevel=window.changeLevel;
window.changeLevel=function(v){if(oldLevel)oldLevel(v);cloudStats=null;setTimeout(render,0);};
const oldTerm=window.changeTerm;
if(oldTerm)window.changeTerm=function(v){oldTerm(v);cloudStats=null;setTimeout(render,0);};
window.startGuidedLearning=start;
window.refreshLearningPath=render;
window.addEventListener('wordspring:progress-loaded',function(e){cloudStats=e.detail||null;render();});
window.addEventListener('wordspring:attempt-saved',function(){if(!cloudStats)setTimeout(render,0);});
window.addEventListener('wordspring:learner-selected',function(){cloudStats=null;setTimeout(render,0);});
setTimeout(render,0);
})();