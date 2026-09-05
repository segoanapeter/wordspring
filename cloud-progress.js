/* WordSpring My Progress 2.0 — learner-specific Supabase progress */
(function(){
  const activityOrder=['sentence','reading','speech','words','grammar','quest'];
  const labels={sentence:'✍️ Sentence Studio',reading:'📖 Read & Understand',speech:'🎙️ Pronunciation Lab',words:'🌱 Word Garden',grammar:'🧩 Grammar Detective',quest:'🏆 Daily Quest'};
  function esc(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML}
  function aggregate(rows){
    const by={}; activityOrder.forEach(k=>by[k]={done:0,correct:0,attempts:0,points:0});
    let done=0,correct=0,attempts=0,points=0;
    rows.forEach(r=>{const k=r.activity_type;if(!by[k])by[k]={done:0,correct:0,attempts:0,points:0};if(r.completed){by[k].done++;done++}if(r.correct!==null){by[k].attempts++;attempts++;if(r.correct){by[k].correct++;correct++}}by[k].points+=Number(r.points)||0;points+=Number(r.points)||0});
    return {by,done,correct,attempts,points,accuracy:attempts?Math.round(correct/attempts*100):0};
  }
  function recommendation(stats){
    const tried=activityOrder.filter(k=>stats.by[k]&&stats.by[k].attempts>0);
    if(!tried.length)return {type:'reading',text:'Start with Read & Understand. A short story is a great first step.'};
    const weakest=tried.sort((a,b)=>(stats.by[a].correct/stats.by[a].attempts)-(stats.by[b].correct/stats.by[b].attempts))[0];
    const s=stats.by[weakest],acc=Math.round(s.correct/s.attempts*100);
    if(acc>=80)return {type:'quest',text:'You are doing brilliantly. Try a Daily Quest to mix your skills together!'};
    return {type:weakest,text:`Let’s grow ${labels[weakest].replace(/^.. /,'')} next. You’re at ${acc}% accuracy, so a little practice can make a big difference.`};
  }
  async function loadCloudProgress(){
    if(!window.activeLearner&&!activeLearner)return null;
    const learner=window.activeLearner||activeLearner;
    const {data,error}=await authClient.from('attempts').select('activity_type,correct,completed,points,created_at').eq('learner_id',learner.id).order('created_at',{ascending:false});
    if(error)throw error; return {learner,rows:data||[],stats:aggregate(data||[])};
  }
  async function openCloudProgress(){
    const target=document.getElementById('lesson');if(!target)return;
    target.innerHTML='<h2>🌱 My Progress</h2><p>Mapula is gathering your learning journey…</p>';
    target.scrollIntoView({behavior:'smooth',block:'start'});
    try{
      const result=await loadCloudProgress();if(!result){target.innerHTML='<h2>🌱 My Progress</h2><p>Choose a learner profile first so I can show their progress.</p>';return}
      const {learner,stats}=result,rec=recommendation(stats);
      const rows=activityOrder.map(k=>{const s=stats.by[k],acc=s.attempts?Math.round(s.correct/s.attempts*100):0;return `<tr><td>${labels[k]}</td><td>${s.done}</td><td>${s.correct}</td><td>${s.attempts?acc+'%':'—'}</td></tr>`}).join('');
      const recent=result.rows.slice(0,5).map(r=>`<span class="progress-chip">${labels[r.activity_type]||esc(r.activity_type)} ${r.correct===true?'✓':r.correct===false?'•':'★'}</span>`).join('');
      target.innerHTML=`<div class="exercise-head"><h2>🌱 ${esc(learner.display_name)}’s Progress</h2><span>Grade ${learner.grade} • Term ${learner.current_term}</span></div><p class="score-context">This progress comes from ${esc(learner.display_name)}’s learner profile, so it can follow them across supported devices.</p><div class="score-cards"><div class="score-card"><b>${stats.points}</b>XP earned</div><div class="score-card"><b>${stats.done}</b>Exercises</div><div class="score-card"><b>${stats.accuracy}%</b>Accuracy</div></div><div class="mapula-progress"><div class="mapula-progress-face">👧🏾</div><div><small>MAPULA RECOMMENDS</small><h3>${esc(rec.text)}</h3><button type="button" class="action" onclick="openLesson('${rec.type}')">Practise now →</button></div></div><h3>Activity progress</h3><table class="score-table"><thead><tr><th>Activity</th><th>Done</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${rows}</tbody></table>${recent?`<h3>Recent learning</h3><div class="progress-chips">${recent}</div>`:''}`;
      const xp=document.getElementById('xp'),accuracy=document.getElementById('accuracy');if(xp)xp.textContent=stats.points+' XP';if(accuracy)accuracy.textContent=stats.accuracy+'%';
    }catch(e){console.warn('Cloud progress unavailable',e);if(typeof window.__localOpenScores==='function')window.__localOpenScores();else target.innerHTML='<h2>🏆 My Progress</h2><p>Progress could not be loaded right now. Your exercises are still safe.</p>'}
  }
  window.__localOpenScores=window.openScores;
  window.openScores=openCloudProgress;
  window.openCloudProgress=openCloudProgress;
})();
