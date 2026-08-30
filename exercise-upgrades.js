// WordSpring exercise upgrades: audio reliability, correct-answer feedback, and no repeats.
(function(){
  function feedbackEl(){ return document.getElementById('feedback'); }

  function setFeedback(text, good){
    const f = feedbackEl();
    if(!f) return;
    f.innerHTML = text;
    f.className = 'feedback ' + (good ? 'good' : 'try');
  }

  function bestEnglishVoice(voices){
    return voices.find(v => (v.lang || '').toLowerCase() === 'en-za')
      || voices.find(v => /south africa/i.test(v.name || ''))
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('en-za'))
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('en-gb'))
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('en'))
      || voices[0];
  }

  function waitForVoices(timeoutMs){
    return new Promise(resolve => {
      const initial = window.speechSynthesis.getVoices();
      if(initial.length){ resolve(initial); return; }
      let finished = false;
      const finish = () => {
        if(finished) return;
        finished = true;
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', finish, {once:true});
      setTimeout(finish, timeoutMs || 1200);
    });
  }

  window.speak = async function(text){
    if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){
      setFeedback('🔇 Voice playback is not supported by this browser. Please use the latest Chrome, Edge or Safari.', false);
      return;
    }

    try{
      const synth = window.speechSynthesis;
      let voices = synth.getVoices();
      if(!voices.length) voices = await waitForVoices(1400);
      const voice = bestEnglishVoice(voices);

      synth.cancel();
      synth.resume();

      const utterance = new SpeechSynthesisUtterance(String(text));
      if(voice){
        utterance.voice = voice;
        utterance.lang = voice.lang || 'en-ZA';
      } else {
        utterance.lang = 'en-ZA';
      }
      utterance.rate = 0.86;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onerror = function(){
        setFeedback('🔇 I could not play the voice on this device. Check that browser/site sound is allowed, then try again.', false);
      };

      // A short delay after cancel() avoids a common Chromium speech-synthesis silence issue.
      setTimeout(function(){
        synth.resume();
        synth.speak(utterance);
      }, 120);
    }catch(err){
      setFeedback('🔇 Voice playback could not start. Please check your browser sound settings and try again.', false);
    }
  };

  function currentCorrectAnswer(){
    if(!current || !current.type) return '';
    const q = banks[level] && banks[level][current.type] && banks[level][current.type][current.index];
    if(!q) return '';
    if(current.type === 'reading') return q[2][q[3]];
    if(current.type === 'words') return q[2][q[3]];
    if(current.type === 'grammar') return q[1][q[2]];
    if(current.type === 'quest') return q[1][q[2]];
    if(current.type === 'sentence') return q[1];
    return '';
  }

  function lockAnswerButtons(){
    document.querySelectorAll('#lesson .choices button').forEach(btn => {
      btn.disabled = true;
      btn.style.cursor = 'default';
    });
  }

  window.answerChoice = function(i, correctIndex){
    const ok = i === correctIndex;
    record(ok);
    lockAnswerButtons();
    if(ok){
      setFeedback('⭐ Correct! Great work.', true);
    }else{
      const answer = currentCorrectAnswer();
      setFeedback('💡 Not quite.<br><strong>Correct answer:</strong> ' + answer, false);
    }
  };

  window.checkWritten = function(expected){
    const input = document.getElementById('answer');
    const a = input ? input.value.trim() : '';
    const ok = /^[A-Z]/.test(a) && /[.!?]$/.test(a) && normal(a) === normal(expected);
    record(ok);
    if(input) input.disabled = true;
    if(ok){
      setFeedback('⭐ Excellent complete sentence!', true);
    }else{
      setFeedback('💡 Good try.<br><strong>Correct answer:</strong> ' + expected, false);
    }
  };

  window.nextExercise = function(){
    if(!current || !current.type) return;
    const n = banks[level][current.type].length;
    const next = current.index + 1;
    if(next < n){
      openLesson(current.type, next);
      return;
    }

    const finishedType = current.type;
    const s = stat(finishedType);
    const accuracy = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
    lesson.innerHTML = `
      <div class="exercise-head"><h2>${titles(finishedType)}</h2><span>Activity complete</span></div>
      <h3>🎉 You completed all ${n} different exercises.</h3>
      <p>No question is repeated in the same activity run.</p>
      <div class="score-cards">
        <div class="score-card"><b>${s.completed}</b>Completed</div>
        <div class="score-card"><b>${s.correct}</b>Correct</div>
        <div class="score-card"><b>${accuracy}%</b>Accuracy</div>
      </div>
      <div class="nav-actions">
        <button type="button" class="secondary" onclick="openScores()">🏆 View score sheet</button>
        <button type="button" class="secondary" onclick="lesson.scrollIntoView({behavior:'smooth'})">✓ Finished</button>
      </div>`;
    lesson.scrollIntoView({behavior:'smooth', block:'start'});
  };
})();