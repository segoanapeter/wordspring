// WordSpring V1 browser smoke-test harness.
// Run in the browser console after the app and curriculum have loaded:
//   await runWordSpringSmokeTest()
(function(){
  'use strict';
  const requiredSelectors=[
    '[data-testid="app-shell"]','[data-testid="active-learner"]','[data-testid="grade-select"]',
    '[data-testid="progress-text"]','[data-testid="activity-sentence"]','[data-testid="activity-reading"]',
    '[data-testid="activity-speech"]','[data-testid="activity-words"]','[data-testid="activity-grammar"]',
    '[data-testid="activity-quest"]','[data-testid="lesson"]'
  ];
  function check(name,pass,detail){return {name,pass:!!pass,detail:detail||''};}
  function readQueue(){try{return JSON.parse(localStorage.getItem('wordspring-attempt-queue-v1')||'[]')}catch(e){return[]}}
  function isolationChecks(){
    const out=[];
    const selected=window.activeLearner||null;
    out.push(check('Active learner context is explicit',!selected||!!selected.id,selected?String(selected.id):'No learner selected'));
    const q=readQueue();
    out.push(check('Every queued attempt belongs to a learner',q.every(a=>!!a.learner_id),q.length+' queued'));
    out.push(check('Every queued attempt has a retry-safe client id',q.every(a=>!!a.client_id),q.length+' queued'));
    if(selected){
      const foreign=q.filter(a=>a.learner_id!==selected.id);
      out.push(check('Queued progress is isolated from active learner',foreign.length===0,foreign.length+' foreign queued attempt(s)'));
      out.push(check('Active learner Grade is valid',Number(selected.grade)>=1&&Number(selected.grade)<=5,'Grade '+selected.grade));
      out.push(check('Active learner Term is valid',Number(selected.current_term)>=1&&Number(selected.current_term)<=4,'Term '+selected.current_term));
      const grade=document.querySelector('[data-testid="grade-select"]');
      out.push(check('UI Grade matches active learner',!grade||grade.value==='grade'+selected.grade,grade?grade.value:'missing'));
    }
    return out;
  }
  async function run(){
    const results=[];
    const validation=typeof window.validateWordSpringCurriculum==='function'?window.validateWordSpringCurriculum():null;
    results.push(check('Curriculum validator available',!!validation));
    if(validation){
      results.push(check('20/20 authored pathways',validation.authoredPathways===20,validation.authoredPathways+'/20'));
      results.push(check('120/120 activity banks',validation.activityBanks===120,validation.activityBanks+'/120'));
      results.push(check('No missing pathways',Array.isArray(validation.missingPathways)&&validation.missingPathways.length===0,(validation.missingPathways||[]).join(', ')));
      results.push(check('No structural errors',Array.isArray(validation.errors)&&validation.errors.length===0,(validation.errors||[]).join('; ')));
    }
    requiredSelectors.forEach(selector=>results.push(check('Selector '+selector,!!document.querySelector(selector))));
    const activities=['sentence','reading','speech','words','grammar','quest'];
    activities.forEach(type=>{
      const el=document.querySelector('[data-testid="activity-'+type+'"]');
      results.push(check('Activity launch control: '+type,!!el&&!el.disabled));
    });
    results.push(...isolationChecks());
    const failed=results.filter(r=>!r.pass);
    const report={ok:failed.length===0,passed:results.length-failed.length,failed:failed.length,results,checkedAt:new Date().toISOString()};
    window.wsV1SmokeReport=report;
    console.table(results);
    if(failed.length) console.error('[WordSpring V1 smoke] FAILED',report); else console.info('[WordSpring V1 smoke] PASS',report);
    window.dispatchEvent(new CustomEvent('wordspring:v1-smoke-complete',{detail:report}));
    return report;
  }
  window.runWordSpringSmokeTest=run;
  window.runWordSpringIsolationChecks=()=>isolationChecks();
})();
