// WordSpring term-based learning layer: Grade -> Term -> Skill -> Exercise.
// Original WordSpring content. Skill organisation is informed by DBE CAPS language strands.
(function(){
  const termNames={term1:'Term 1',term2:'Term 2',term3:'Term 3',term4:'Term 4'};
  let term=localStorage.getItem('wsTerm')||'term1';
  if(!termNames[term]) term='term1';
  window.wsTerm=term;

  const focus={
    grade1:{term1:'Sounds, phonics, simple words and sentences',term2:'Word reading, sentence meaning and punctuation',term3:'Fluency, vocabulary and short comprehension',term4:'Independent sentences and reading review'},
    grade2:{term1:'Phonics review, sentence building and literal meaning',term2:'Vocabulary, plurals, verbs and comprehension',term3:'Past tense, sequencing and reading fluency',term4:'Consolidation, editing and independent reading'},
    grade3:{term1:'Fluency, vocabulary and sentence expansion',term2:'Comprehension, tenses and language conventions',term3:'Inference, adjectives, adverbs and paragraph meaning',term4:'Independent reading, editing and consolidation'},
    grade4:{term1:'Transition to Intermediate Phase reading and language',term2:'Main ideas, vocabulary, grammar and writing',term3:'Inference, information texts and complex sentences',term4:'Critical reading, editing and year consolidation'},
    grade5:{term1:'Reading strategies, vocabulary and sentence control',term2:'Information texts, inference and language structures',term3:'Critical reading, source awareness and complex language',term4:'Independent comprehension, editing and consolidation'}
  };

  // Preserve the grade-specific base banks, then create four distinct term variants.
  const base={};
  ['grade1','grade2','grade3','grade4','grade5'].forEach(g=>{base[g]={};Object.keys(banks[g]||{}).forEach(type=>base[g][type]=(banks[g][type]||[]).slice());});
  const rotate=(arr,n)=>arr.length?arr.slice(n%arr.length).concat(arr.slice(0,n%arr.length)):[];
  function applyTerm(){
    const offset={term1:0,term2:1,term3:2,term4:3}[term];
    Object.keys(base).forEach(g=>Object.keys(base[g]).forEach(type=>{banks[g][type]=rotate(base[g][type],offset);}));
  }
  applyTerm();

  function addTermSelector(){
    const actions=document.querySelector('.header-actions'); if(!actions||document.getElementById('termSelect')) return;
    const gradeLabel=document.getElementById('levelSelect')?.closest('label');
    const label=document.createElement('label'); label.innerHTML='Term <select id="termSelect"><option value="term1">Term 1</option><option value="term2">Term 2</option><option value="term3">Term 3</option><option value="term4">Term 4</option></select>';
    if(gradeLabel) gradeLabel.insertAdjacentElement('afterend',label); else actions.prepend(label);
    const select=label.querySelector('select'); select.value=term; select.addEventListener('change',e=>window.changeTerm(e.target.value));
  }

  function updateFocus(){
    let box=document.getElementById('curriculumFocus');
    if(!box){
      box=document.createElement('section'); box.id='curriculumFocus'; box.className='curriculum-focus';
      const progress=document.querySelector('.progress-wrap'); if(progress) progress.insertAdjacentElement('afterend',box);
    }
    const grade=(window.gradeNames&&gradeNames[level])||level;
    box.innerHTML='<div><b>📚 '+grade+' • '+termNames[term]+'</b><span>'+((focus[level]||{})[term]||'Grade-level literacy practice')+'</span></div><small>Skills: Listening & Speaking • Reading & Viewing • Writing & Presenting • Language Structures & Conventions</small>';
  }

  window.changeTerm=function(v){
    if(!termNames[v]) return; term=v; window.wsTerm=v; localStorage.setItem('wsTerm',v); applyTerm(); updateFocus();
    if(window.lesson) lesson.innerHTML='<h2>'+((gradeNames&&gradeNames[level])||'Grade')+' • '+termNames[v]+'</h2><p>'+focus[level][v]+'. Choose an activity to begin.</p>';
    if(typeof updateStats==='function') updateStats();
  };

  const oldChange=window.changeLevel;
  window.changeLevel=function(v){ if(oldChange) oldChange(v); updateFocus(); };

  // Skill-aware score sheet: adds grade/term context while retaining existing scoring engine.
  const oldScores=window.openScores;
  window.openScores=function(){
    if(oldScores) oldScores();
    const heading=document.querySelector('#lesson h2');
    if(heading) heading.insertAdjacentHTML('afterend','<p class="score-context"><strong>'+((gradeNames&&gradeNames[level])||level)+' • '+termNames[term]+'</strong><br>Progress is grouped across sentence writing, reading, pronunciation/phonics, vocabulary, grammar and mixed literacy.</p>');
  };

  addTermSelector(); updateFocus();
})();