// WordSpring reliable voice controls for Pronunciation Lab and Word Garden.
// Uses safe event listeners instead of dynamic inline onclick strings.
(function(){
  function getQuestion(type){
    try{
      if(!window.current && typeof current==='undefined') return null;
      return banks[level]?.[type]?.[current.index] || null;
    }catch(e){ return null; }
  }

  function feedback(message){
    const f=document.getElementById('feedback');
    if(f){
      f.textContent=message;
      f.className='feedback try';
    }
  }

  function voiceButton(){
    return [...document.querySelectorAll('#lesson button')].find(btn=>/hear south african pronunciation|hear word/i.test(btn.textContent));
  }

  function bindVoice(){
    try{
      if(!current || (current.type!=='speech' && current.type!=='words')) return;
      const btn=voiceButton();
      if(!btn || btn.dataset.voiceBound==='1') return;
      const q=getQuestion(current.type);
      if(!q || !q[0]) return;
      const word=String(q[0]);

      // Dynamic inline onclick handlers can break when content contains punctuation.
      // Remove them and use a normal click listener.
      btn.removeAttribute('onclick');
      btn.onclick=null;
      btn.dataset.voiceBound='1';
      btn.addEventListener('click',function(){
        if(typeof window.speak!=='function'){
          feedback('🔇 Voice is still loading. Please try again in a moment.');
          return;
        }
        window.speak(word);
      });
    }catch(e){ console.warn('WordSpring voice binding:',e); }
  }

  const lesson=document.getElementById('lesson');
  if(lesson){
    new MutationObserver(bindVoice).observe(lesson,{childList:true,subtree:true});
  }
  document.addEventListener('DOMContentLoaded',bindVoice);
  setTimeout(bindVoice,0);
})();