// WordSpring answer status and reliable per-activity marking.
// Sentence Studio saves each response and shows corrections only after the full activity.
(function(){
  let run = {type:null, startAttempts:0, startCorrect:0, startCompleted:0};
  let answeredCurrent=false;
  let sentenceReview=[];

  function snapshot(type){
    const s=stat(type)||{};
    return {
      type,
      startAttempts:Number(s.attempts||0),
      startCorrect:Number(s.correct||0),
      startCompleted:Number(s.completed||0)
    };
  }

  function startRun(type){
    run=snapshot(type);
    answeredCurrent=false;
    if(type==='sentence') sentenceReview=[];
  }

  function ensureRun(type){
    if(!run.type || run.type!==type) startRun(type);
  }

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }

  function currentCorrectAnswer(){
    if(!current || !current.type) return '';
    const q=banks[level]?.[current.type]?.[current.index];
    if(!q) return '';
    if(current.type==='reading' || current.type==='words') return q[2][q[3]];
    if(current.type==='grammar' || current.type==='quest') return q[1][q[2]];
    if(current.type==='sentence') return q[1];
    return '';
  }

  function statusMarkup(ok,extra=''){
    return `<div class="answer-status ${ok?'answer-correct':'answer-wrong'}"><span class="answer-icon">${ok?'✓':'✕'}</span><div><strong>${ok?'Correct':'Wrong'}</strong>${extra?`<div class="answer-detail">${extra}</div>`:''}</div></div>`;
  }

  function showStatus(ok,extra=''){
    const f=document.getElementById('feedback');
    if(!f) return;
    f.innerHTML=statusMarkup(ok,extra);
    f.className='feedback '+(ok?'good':'try');
  }

  function showSaved(){
    const f=document.getElementById('feedback');
    if(!f) return;
    f.innerHTML='<div class="answer-status"><span class="answer-icon">✓</span><div><strong>Answer saved</strong><div class="answer-detail">Continue to the next sentence. Your corrections will be shown at the end.</div></div></div>';
    f.className='feedback good';
  }

  function markChoiceButtons(selected,correct){
    [...document.querySelectorAll('#lesson .choices button')].forEach((btn,i)=>{
      btn.disabled=true;
      btn.classList.remove('choice-correct','choice-wrong');
      if(i===correct) btn.classList.add('choice-correct');
      if(i===selected && selected!==correct) btn.classList.add('choice-wrong');
      if(i===correct && !btn.querySelector('.choice-mark')) btn.insertAdjacentHTML('beforeend','<span class="choice-mark"> ✓</span>');
      if(i===selected && selected!==correct && !btn.querySelector('.choice-mark')) btn.insertAdjacentHTML('beforeend','<span class="choice-mark"> ✕</span>');
    });
  }

  function lockWrittenButton(){
    [...document.querySelectorAll('#lesson button')].forEach(btn=>{
      if(/check answer/i.test(btn.textContent)) btn.disabled=true;
    });
  }

  function sentenceMistakes(answer,expected){
    const mistakes=[];
    if(!/^[A-Z]/.test(answer)) mistakes.push('Start the sentence with a capital letter.');
    if(!/[.!?]$/.test(answer)) mistakes.push('Finish the sentence with punctuation.');
    if(normal(answer)!==normal(expected)) mistakes.push('Check the word order and make sure all the needed words are used.');
    return mistakes;
  }

  // app-fixed.js builds the Sentence Studio check button with an inline expected-answer
  // argument. Quotation marks inside that generated attribute can prevent the click from
  // reaching checkWritten(). Bind the button safely after every sentence is rendered.
  function bindSentenceCheckButton(){
    if(!current || current.type!=='sentence') return;
    const input=document.getElementById('answer');
    if(!input) return;
    const btn=[...document.querySelectorAll('#lesson button')].find(b=>/check answer/i.test(b.textContent));
    if(!btn) return;
    const q=banks[level]?.sentence?.[current.index];
    const expected=q?.[1] || '';
    btn.removeAttribute('onclick');
    btn.onclick=null;
    btn.addEventListener('click',function sentenceCheckHandler(){
      window.checkWritten(expected);
    },{once:true});
  }

  const baseOpenLesson=window.openLesson;
  window.openLesson=function(type,index=0){
    if(index===0) startRun(type); else ensureRun(type);
    answeredCurrent=false;
    baseOpenLesson(type,index);
    if(type==='sentence') bindSentenceCheckButton();
  };

  window.answerChoice=function(i,correctIndex){
    if(answeredCurrent) return;
    ensureRun(current.type);
    answeredCurrent=true;
    const ok=i===correctIndex;
    record(ok);
    markChoiceButtons(i,correctIndex);
    if(ok) showStatus(true,'Well done — you chose the correct answer.');
    else showStatus(false,`<strong>Correct answer:</strong> ${currentCorrectAnswer()}`);
  };

  window.checkWritten=function(expected){
    if(answeredCurrent) return;
    ensureRun(current.type);
    const input=document.getElementById('answer');
    const a=input?input.value.trim():'';
    if(!a){showStatus(false,'Please write your answer before saving it.');return;}

    answeredCurrent=true;
    const mistakes=sentenceMistakes(a,expected);
    const ok=mistakes.length===0;
    record(ok);

    if(current.type==='sentence'){
      sentenceReview.push({
        number:current.index+1,
        answer:a,
        expected,
        ok,
        mistakes
      });
      if(input) input.disabled=true;
      lockWrittenButton();
      showSaved();
      return;
    }

    if(input){input.disabled=true;input.classList.add(ok?'written-correct':'written-wrong');}
    lockWrittenButton();
    if(ok) showStatus(true,'Your sentence is correct.');
    else showStatus(false,`<strong>Correct answer:</strong> ${expected}`);
  };

  window.selfPractice=function(){
    if(answeredCurrent) return;
    ensureRun(current.type);
    answeredCurrent=true;
    record(true);
    const btn=[...document.querySelectorAll('#lesson button')].find(b=>/I practised this word/i.test(b.textContent));
    if(btn){btn.disabled=true;btn.classList.add('choice-correct');btn.innerHTML='✓ Practice completed';}
    showStatus(true,'Pronunciation practice completed.');
  };

  function runResults(type){
    ensureRun(type);
    const s=stat(type)||{};
    const answered=Math.max(0,Number(s.attempts||0)-run.startAttempts);
    const correct=Math.max(0,Number(s.correct||0)-run.startCorrect);
    const completed=Math.max(0,Number(s.completed||0)-run.startCompleted);
    const wrong=Math.max(0,answered-correct);
    const accuracy=answered?Math.round(correct/answered*100):0;
    return {answered,correct,wrong,completed,accuracy};
  }

  function sentenceReviewMarkup(){
    const wrong=sentenceReview.filter(x=>!x.ok);
    if(!wrong.length){
      return '<section class="sentence-review"><h3>🌟 Excellent work!</h3><p>You completed every sentence correctly.</p></section>';
    }
    return `<section class="sentence-review">
      <h3>📝 Review your mistakes</h3>
      <p>Look at each correction before trying the activity again.</p>
      ${wrong.map(item=>`<div class="tip sentence-review-item">
        <strong>Exercise ${item.number}</strong>
        <p><b>Your answer:</b> ${esc(item.answer)}</p>
        <p><b>Model answer:</b> ${esc(item.expected)}</p>
        <p><b>What to fix:</b> ${item.mistakes.map(esc).join(' ')}</p>
        <button type="button" class="link-button" onclick="speak(${JSON.stringify(item.expected)})">🔊 Listen to model answer</button>
      </div>`).join('')}
    </section>`;
  }

  window.nextExercise=function(){
    if(!current || !current.type) return;
    const type=current.type;
    const n=banks[level][type].length;

    if(!answeredCurrent){
      showStatus(false,type==='speech'?'Please complete the pronunciation practice before continuing.':'Please answer this exercise before continuing.');
      return;
    }

    const next=current.index+1;
    if(next<n){
      answeredCurrent=false;
      baseOpenLesson(type,next);
      if(type==='sentence') bindSentenceCheckButton();
      return;
    }

    const r=runResults(type);
    lesson.innerHTML=`
      <div class="exercise-head"><h2>${titles(type)}</h2><span>Activity complete</span></div>
      <h3>🎉 You completed all ${n} exercises.</h3>
      <p>Your results for this activity:</p>
      <div class="score-cards activity-results">
        <div class="score-card"><b>${r.answered}</b>Answered</div>
        <div class="score-card result-correct"><b>✓ ${r.correct}</b>Correct</div>
        <div class="score-card result-wrong"><b>✕ ${r.wrong}</b>Wrong</div>
        <div class="score-card"><b>${r.accuracy}%</b>Accuracy</div>
      </div>
      ${type==='sentence'?sentenceReviewMarkup():''}
      <div class="nav-actions">
        <button type="button" class="secondary" onclick="openScores()">🏆 View score sheet</button>
        <button type="button" class="secondary" onclick="openLesson('${type}',0)">↻ Try activity again</button>
      </div>`;
    lesson.scrollIntoView({behavior:'smooth',block:'start'});
    answeredCurrent=false;
  };
})();