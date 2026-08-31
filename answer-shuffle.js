// WordSpring answer-position randomiser.
// Shuffles multiple-choice options at render time while preserving the correct answer index.
(function(){
  let lastCorrectPosition = null;

  function shuffledEntries(options, correctIndex){
    const entries = options.map((text, originalIndex)=>({
      text,
      correct: originalIndex===correctIndex
    }));

    // Fisher-Yates shuffle.
    for(let i=entries.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [entries[i],entries[j]]=[entries[j],entries[i]];
    }

    // Avoid putting the correct answer in the same position repeatedly when possible.
    let newCorrect=entries.findIndex(x=>x.correct);
    if(entries.length>1 && newCorrect===lastCorrectPosition){
      const swapWith=(newCorrect+1+Math.floor(Math.random()*(entries.length-1)))%entries.length;
      [entries[newCorrect],entries[swapWith]]=[entries[swapWith],entries[newCorrect]];
      newCorrect=entries.findIndex(x=>x.correct);
    }
    lastCorrectPosition=newCorrect;
    return {entries,newCorrect};
  }

  window.choices=function(options,correctIndex){
    const {entries,newCorrect}=shuffledEntries(options,correctIndex);
    return '<div class="choices">'+entries.map((entry,i)=>
      `<button type="button" onclick="answerChoice(${i},${newCorrect})">${entry.text}</button>`
    ).join('')+'</div>';
  };
})();