// Cloud-first Mapula guided learning for WordSpring.
(function(){
  const order=['sentence','reading','speech','words','grammar','quest'];
  const names={sentence:'Sentence Studio',reading:'Read & Understand',speech:'Pronunciation Lab',words:'Word Garden',grammar:'Grammar Detective',quest:'Daily Quest'};
  const icons={sentence:'✍️',reading:'📖',speech:'🎙️',words:'🌱',grammar:'🧩',quest:'🏆'};
  let latest=null;

  function choose(stats){
    if(!stats||!stats.by)return null;
    const rows=order.map(type=>{
      const s=stats.by[type]||{};
      const attempts=Number(s.attempts||0), correct=Number(s.correct||0), done=Number(s.done||0);
      return {type,attempts,correct,done,accuracy:attempts?Math.round(correct/attempts*100):null};
    });
    const fresh=rows.find(r=>r.attempts===0);
    if(fresh)return fresh;
    const weakest=rows.slice().sort((a,b)=>a.accuracy-b.accuracy)[0];
    if(weakest&&weakest.accuracy>=80)return rows.find(r=>r.type==='quest')||weakest;
    return weakest;
  }

  function nextIndex(type,done){
    try{
      const count=banks[level][type].length;
      return count?done%count:0;
    }catch(e){return 0;}
  }

  function start(type){
    const r=latest&&choose(latest);
    const chosen=type||(r&&r.type)||'reading';
    const done=r&&r.type===chosen?r.done:0;
    openLesson(chosen,nextIndex(chosen,done));
    const target=document.getElementById('lesson');
    const head=target&&target.querySelector('.exercise-head');
    if(head){
      const note=document.createElement('div');
      note.className='tip guided-note';
      note.innerHTML='<b>👧🏾 Mapula chose this practice for you.</b> Finish it and I’ll use your result to choose what comes next.';
      head.insertAdjacentElement('afterend',note);
    }
  }

  function render(){
    const r=choose(latest);
    const box=document.getElementById('learningPath');
    if(!r||!box)return;
    const reason=r.accuracy===null?'You have not practised this skill yet. Let’s try it next.':(r.accuracy>=80&&r.type==='quest'?'Your skills are growing strongly. Mix them together in a Daily Quest.':'Your current accuracy here is '+r.accuracy+'%. Focused practice can help this skill grow.');
    const heading=box.querySelector('h2');
    const text=box.querySelector('p');
    const button=box.querySelector('#recommendedStart');
    const small=box.querySelector('small');
    if(small)small.textContent='MAPULA • CONTINUE LEARNING';
    if(heading)heading.textContent=icons[r.type]+' '+names[r.type];
    if(text)text.textContent=reason;
    if(button){button.textContent='Continue learning →';button.onclick=function(){start(r.type);};}
  }

  window.startGuidedLearning=start;
  window.addEventListener('wordspring:progress-loaded',function(e){latest=e.detail||null;render();});
  window.addEventListener('wordspring:learner-selected',function(){latest=null;});
})();