// WordSpring answer status layer: clear tick/cross feedback and accurate per-activity results.
(function(){
  let activityRun = {type:null, correct:0, wrong:0, answered:0};

  function ensureRun(){
    if(!current || !current.type) return;
    if(activityRun.type !== current.type || current.index === 0 && activityRun.answered >= (banks[level]?.[current.type]?.length || 0)){
      activityRun = {type:current.type, correct:0, wrong:0, answered:0};
    }
  }

  function resetRunFor(type){
    activityRun = {type, correct:0, wrong:0, answered:0};
  }

  const originalOpenLesson = window.openLesson;
  window.openLesson = function(type,index=0){
    if(index === 0 && activityRun.type !== type) resetRunFor(type);
    originalOpenLesson(type,index);
  };

  function recordRun(ok){
    ensureRun();
    activityRun.answered++;
    if(ok) activityRun.correct++; else activityRun.wrong++;
  }

  function currentCorrectAnswer(){
    if(!current || !current.type) return '';
    const q = banks[level]?.[current.type]?.[current.index];
    if(!q) return '';
    if(current.type === 'reading' || current.type === 'words') return q[2][q[3]];
    if(current.type === 'grammar' || current.type === 'quest') return q[1][q[2]];
    if(current.type === 'sentence') return q[1];
    return '';
  }

  function statusMarkup(ok, extra=''){
    return `<div class="answer-status ${ok?'answer-correct':'answer-wrong'}"><span class="answer-icon">${ok?'✓':'✕'}</span><div><strong>${ok?'Correct':'Wrong'}</strong>${extra?`<div class="answer-detail">${extra}</div>`:''}</div></div>`;
  }

  function showStatus(ok, extra=''){
    const f=document.getElementById('feedback');
    if(!f) return;
    f.innerHTML=statusMarkup(ok,extra);
    f.className='feedback '+(ok?'good':'try');
  }

  function markChoiceButtons(selected, correct){
    const buttons=[...document.querySelectorAll('#lesson .choices button')];
    buttons.forEach((btn,i)=>{
      btn.disabled=true;
      btn.classList.remove('choice-correct','choice-wrong');
      if(i===correct) btn.classList.add('choice-correct');
      if(i===selected && selected!==correct) btn.classList.add('choice-wrong');
      if(i===correct && !btn.querySelector('.choice-mark')) btn.insertAdjacentHTML('beforeend','<span class="choice-mark"> ✓</span>');
      if(i===selected && selected!==correct && !btn.querySelector('.choice-mark')) btn.insertAdjacentHTML('beforeend','<span class="choice-mark"> ✕</span>');
    });
  }

  window.answerChoice=function(i,correctIndex){
    const ok=i===correctIndex;
    record(ok);
    recordRun(ok);
    markChoiceButtons(i,correctIndex);
    if(ok) showStatus(true,'Well done — you chose the correct answer.');
    else showStatus(false,`<strong>Correct answer:</strong> ${currentCorrectAnswer()}`);
  };

  window.checkWritten=function(expected){
    const input=document.getElementById('answer');
    const a=input?input.value.trim():'';
    const ok=/^[A-Z]/.test(a)&&/[.!?]$/.test(a)&&normal(a)===normal(expected);
    record(ok);
    recordRun(ok);
    if(input){
      input.disabled=true;
      input.classList.add(ok?'written-correct':'written-wrong');
    }
    if(ok) showStatus(true,'Your sentence is correct.');
    else showStatus(false,`<strong>Correct answer:</strong> ${expected}`);
  };

  window.selfPractice=function(){
    record(true);
    recordRun(true);
    const btn=[...document.querySelectorAll('#lesson button')].find(b=>/I practised this word/i.test(b.textContent));
    if(btn){btn.disabled=true;btn.classList.add('choice-correct');btn.innerHTML='✓ Practice completed';}
    showStatus(true,'Pronunciation practice completed.');
  };

  window.nextExercise=function(){
    if(!current || !current.type) return;
    const type=current.type;
    const n=banks[level][type].length;
    const next=current.index+1;
    if(next<n){
      originalOpenLesson(type,next);
      return;
    }
    ensureRun();
    const answered=activityRun.answered;
    const correct=activityRun.correct;
    const wrong=activityRun.wrong;
    const accuracy=answered?Math.round(correct/answered*100):0;
    lesson.innerHTML=`
      <div class="exercise-head"><h2>${titles(type)}</h2><span>Activity complete</span></div>
      <h3>🎉 You completed all ${n} different exercises.</h3>
      <p>Your results for this activity:</p>
      <div class="score-cards activity-results">
        <div class="score-card"><b>${answered}</b>Answered</div>
        <div class="score-card result-correct"><b>✓ ${correct}</b>Correct</div>
        <div class="score-card result-wrong"><b>✕ ${wrong}</b>Wrong</div>
        <div class="score-card"><b>${accuracy}%</b>Accuracy</div>
      </div>
      <div class="nav-actions">
        <button type="button" class="secondary" onclick="openScores()">🏆 View score sheet</button>
        <button type="button" class="secondary" onclick="openLesson('${type}',0)">↻ Try activity again</button>
      </div>`;
    lesson.scrollIntoView({behavior:'smooth',block:'start'});
    resetRunFor(type);
  };
})();