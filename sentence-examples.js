// WordSpring Sentence Studio examples.
// Gives learners grade-appropriate model sentences without revealing the current answer.
(function(){
  const examples={
    grade1:[
      'The dog runs.',
      'I have a red ball.',
      'We read books at school.'
    ],
    grade2:[
      'My sister reads a story.',
      'The birds build a nest in the tree.',
      'We walked to school this morning.'
    ],
    grade3:[
      'The learners quietly read in the library.',
      'After school, we practised soccer.',
      'Because it was cold, I wore a jacket.'
    ],
    grade4:[
      'Before assembly, the class practised the speech.',
      'The learners carefully completed the science project.',
      'Although the rain continued, the match finished.'
    ],
    grade5:[
      'Learners who practised regularly improved their reading fluency.',
      'After comparing the sources, Lerato identified the reliable information.',
      'Because the research was thorough, the presentation was convincing.'
    ]
  };

  function addExamples(){
    try{
      if(!current || current.type!=='sentence') return;
      if(document.getElementById('sentenceExamples')) return;
      const input=document.getElementById('answer');
      if(!input) return;
      const list=examples[level] || examples.grade1;
      const box=document.createElement('div');
      box.id='sentenceExamples';
      box.className='sentence-examples';
      box.innerHTML=`
        <button type="button" class="secondary" id="showSentenceExamples">💡 See sentence examples</button>
        <div id="sentenceExamplePanel" class="tip hidden">
          <strong>Examples of complete sentences</strong>
          <p>Notice the capital letter, correct word order and punctuation.</p>
          <div class="example-list">${list.map((x,i)=>`<p><b>${i+1}.</b> ${x} <button type="button" class="link-button" data-example="${i}">🔊 Listen</button></p>`).join('')}</div>
          <small>These are examples only. Write your own answer using the words in the exercise.</small>
        </div>`;
      input.insertAdjacentElement('beforebegin',box);
      const toggle=document.getElementById('showSentenceExamples');
      const panel=document.getElementById('sentenceExamplePanel');
      toggle.onclick=()=>{
        const opening=panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        toggle.textContent=opening?'🙈 Hide examples':'💡 See sentence examples';
      };
      box.querySelectorAll('[data-example]').forEach(btn=>{
        btn.onclick=()=>speak(list[Number(btn.dataset.example)]);
      });
    }catch(e){ console.warn('Sentence examples:',e); }
  }

  const lesson=document.getElementById('lesson');
  if(lesson){
    const observer=new MutationObserver(addExamples);
    observer.observe(lesson,{childList:true,subtree:true});
  }
  document.addEventListener('DOMContentLoaded',addExamples);
  setTimeout(addExamples,0);
})();