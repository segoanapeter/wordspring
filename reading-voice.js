// WordSpring Read & Understand voice controls.
// Adds separate audio for the passage, question and answer choices.
(function(){
  function readingQuestion(){
    if(!window.current && typeof current === 'undefined') return null;
    try { return banks[level]?.reading?.[current.index] || null; } catch(e){ return null; }
  }

  window.readPassageAloud=function(){
    const q=readingQuestion();
    if(q) speak(q[0]);
  };

  window.readQuestionAloud=function(){
    const q=readingQuestion();
    if(q) speak(q[1]);
  };

  window.readAnswersAloud=function(){
    const q=readingQuestion();
    if(!q) return;
    const labels=['A','B','C','D'];
    const text=q[2].map((answer,i)=>`${labels[i] || i+1}. ${answer}`).join('. ');
    speak('Answer choices. '+text);
  };

  window.readReadingExerciseAloud=function(){
    const q=readingQuestion();
    if(!q) return;
    const labels=['A','B','C','D'];
    const answers=q[2].map((answer,i)=>`${labels[i] || i+1}. ${answer}`).join('. ');
    speak(`${q[0]} Question. ${q[1]} Answer choices. ${answers}`);
  };

  function enhanceReading(){
    try{
      if(!current || current.type!=='reading') return;
      const story=document.getElementById('story');
      if(!story || document.getElementById('readingVoiceTools')) return;
      const existing=story.nextElementSibling;
      const tools=document.createElement('div');
      tools.id='readingVoiceTools';
      tools.className='reading-voice-tools';
      tools.innerHTML=`
        <button type="button" class="secondary" onclick="readPassageAloud()">🔊 Read passage</button>
        <button type="button" class="secondary" onclick="readQuestionAloud()">🔊 Read question</button>
        <button type="button" class="secondary" onclick="readAnswersAloud()">🔊 Read answers</button>
        <button type="button" class="action" onclick="readReadingExerciseAloud()">🎧 Read everything</button>`;
      if(existing && existing.tagName==='BUTTON') existing.replaceWith(tools);
      else story.insertAdjacentElement('afterend',tools);
    }catch(e){ console.warn('Reading voice controls:',e); }
  }

  const observer=new MutationObserver(enhanceReading);
  const lesson=document.getElementById('lesson');
  if(lesson) observer.observe(lesson,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',enhanceReading);
  setTimeout(enhanceReading,0);
})();