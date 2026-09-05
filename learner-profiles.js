let activeLearner=null;
const learnerAvatars=['🌱','📚','🦁','🐘','🦋','🌻','🚀'];

async function learnerSession(){const {data}=await authClient.auth.getSession();return data.session}
async function loadLearners(){
  const session=await learnerSession(); if(!session)return;
  const {data,error}=await authClient.from('learners').select('*').order('created_at');
  if(error){console.error(error);return}
  renderLearnerPicker(data||[]);
}
function renderLearnerPicker(learners){
  const picker=document.getElementById('learnerPicker'); if(!picker)return;
  const list=document.getElementById('learnerList');
  list.innerHTML='';
  learners.forEach(l=>{
    const b=document.createElement('button'); b.type='button'; b.className='learner-card';
    b.innerHTML=`<span>${l.avatar||'🌱'}</span><b>${escapeLearner(l.display_name)}</b><small>Grade ${l.grade} • Term ${l.current_term}</small>`;
    b.onclick=()=>selectLearner(l); list.appendChild(b);
  });
  picker.classList.remove('hidden');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('emptyLearners').classList.toggle('hidden',learners.length>0);
}
function escapeLearner(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function openAddLearner(){
  document.getElementById('learnerForm').reset();
  document.getElementById('learnerAvatar').value='🌱';
  document.getElementById('learnerFormWrap').classList.remove('hidden');
  document.getElementById('learnerName').focus();
}
function closeAddLearner(){document.getElementById('learnerFormWrap').classList.add('hidden')}
async function saveLearner(e){
  e.preventDefault(); const session=await learnerSession(); if(!session)return;
  const display_name=document.getElementById('learnerName').value.trim();
  const grade=Number(document.getElementById('learnerGrade').value);
  const current_term=Number(document.getElementById('learnerTerm').value);
  const avatar=document.getElementById('learnerAvatar').value;
  const {error}=await authClient.from('learners').insert({owner_id:session.user.id,display_name,grade,current_term,avatar});
  if(error){document.getElementById('learnerFormMessage').textContent=error.message;return}
  closeAddLearner(); await loadLearners();
}
function selectLearner(l){
  activeLearner=l; window.activeLearner=l; localStorage.setItem('wordspring-active-learner',l.id);
  document.getElementById('learnerPicker').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  document.getElementById('activeLearnerName').textContent=`${l.avatar||'🌱'} ${l.display_name}`;
  const level=`grade${l.grade}`; const select=document.getElementById('levelSelect'); if(select)select.value=level;
  if(typeof changeLevel==='function')changeLevel(level);
  if(typeof window.setTerm==='function')window.setTerm(l.current_term);
  if(typeof updateStats==='function')updateStats();
}
function switchLearner(){activeLearner=null;window.activeLearner=null;loadLearners()}
async function restoreLearner(){
  const session=await learnerSession();if(!session)return;
  const {data}=await authClient.from('learners').select('*').order('created_at');
  const learners=data||[]; const wanted=localStorage.getItem('wordspring-active-learner');
  const found=learners.find(l=>l.id===wanted);
  if(found)selectLearner(found);else renderLearnerPicker(learners);
}
async function recordCloudAttempt(activityType,exerciseIndex,correct,responseText=''){
  if(!activeLearner)return;
  const session=await learnerSession();if(!session)return;
  await authClient.from('attempts').insert({owner_id:session.user.id,learner_id:activeLearner.id,grade:activeLearner.grade,term:activeLearner.current_term,activity_type:activityType,exercise_index:Number(exerciseIndex)||0,correct:correct===null?null:!!correct,completed:true,points:correct===true?10:2,response_text:String(responseText||'').slice(0,500)});
}
window.restoreLearner=restoreLearner;window.recordCloudAttempt=recordCloudAttempt;
