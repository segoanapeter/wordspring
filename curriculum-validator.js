// WordSpring curriculum validator: verifies authored Grade -> Term -> Activity banks.
(function(){
  'use strict';
  const grades=['grade1','grade2','grade3','grade4','grade5'];
  const terms=['term1','term2','term3','term4'];
  const activities=['sentence','reading','speech','words','grammar','quest'];
  const choiceTypes=new Set(['reading','words','grammar','quest']);

  function validateExercise(type,exercise,path,errors){
    if(!Array.isArray(exercise)||exercise.length<2){errors.push(path+': exercise must be an array with at least 2 fields');return;}
    if(choiceTypes.has(type)){
      const options=(type==='reading'||type==='words')?exercise[2]:exercise[1];
      const answer=(type==='reading'||type==='words')?exercise[3]:exercise[2];
      if(!Array.isArray(options)||options.length<2)errors.push(path+': multiple-choice exercise needs at least 2 options');
      if(!Number.isInteger(answer)||!Array.isArray(options)||answer<0||answer>=options.length)errors.push(path+': answer index is invalid');
    }
    if(type==='sentence'&&(!exercise[0]||!exercise[1]))errors.push(path+': sentence prompt/answer is missing');
    if(type==='speech'&&(!exercise[0]||!exercise[1]))errors.push(path+': pronunciation word/breakdown is missing');
  }

  function validate(){
    const banks=window.wsTermBanks||{};
    const errors=[]; const missing=[]; let pathways=0; let activityBanks=0; let exercises=0;
    grades.forEach(grade=>terms.forEach(term=>{
      const termBank=banks[grade]&&banks[grade][term];
      if(!termBank){missing.push(grade+'/'+term);return;}
      pathways++;
      activities.forEach(type=>{
        const list=termBank[type]; const path=grade+'/'+term+'/'+type;
        if(!Array.isArray(list)||!list.length){errors.push(path+': activity bank is missing or empty');return;}
        activityBanks++; exercises+=list.length;
        list.forEach((exercise,i)=>validateExercise(type,exercise,path+'['+i+']',errors));
      });
    }));
    const report={ok:errors.length===0,authoredPathways:pathways,totalPathways:20,activityBanks,expectedActivityBanks:pathways*activities.length,exerciseCount:exercises,missingPathways:missing,errors,checkedAt:new Date().toISOString()};
    window.wsCurriculumValidation=report;
    if(errors.length)console.error('[WordSpring curriculum] validation failed',report); else console.info('[WordSpring curriculum] authored banks valid',report);
    window.dispatchEvent(new CustomEvent('wordspring:curriculum-validated',{detail:report}));
    return report;
  }

  window.validateWordSpringCurriculum=validate;
  if(window.wsTermBanks)validate();
  window.addEventListener('wordspring:curriculum-ready',validate);
})();
