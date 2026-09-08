let activeLearner=null;
const learnerAvatars=['🌱','📚','🦁','🐘','🦋','🌻','🚀'];
const attemptQueueKey='wordspring-attempt-queue-v1';
let attemptSyncing=false;

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
function openAddLearner(){document.getElementById('learnerForm').reset();document.getElementById('learnerAvatar').value='🌱';document.getElementById('learnerFormWrap').classList.remove('hidden');document.getElementById('learnerName').focus()}
function closeAddLearner(){document.getElementById('learnerFormWrap').classList.add('hidden')}
async function saveLearner(e){e.preventDefault();const session=await learnerSession();if(!session)return;const display_name=document.getElementById('learnerName').value.trim(),grade=Number(document.getElementById('learnerGrade').value),current_term=Number(document.getElementById('learnerTerm').value),avatar=document.getElementById('learnerAvatar').value;const{error}=await authClient.from('learners').insert({owner_id:session.user.id,display_name,grade,current_term,avatar});if(error){document.getElementById('learnerFormMessage').textContent=error.message;return}closeAddLearner();await loadLearners()}
function selectLearner(l){activeLearner=l;window.activeLearner=l;localStorage.setItem('wordspring-active-learner',l.id);document.getElementById('learnerPicker').classList.add('hidden');document.getElementById('appShell').classList.remove('hidden');document.getElementById('activeLearnerName').textContent=`${l.avatar||'🌱'} ${l.display_name}`;const level=`grade${l.grade}`,select=document.getElementById('levelSelect');if(select)select.value=level;if(typeof changeLevel==='function')changeLevel(level);if(typeof window.setTerm==='function')window.setTerm(l.current_term);if(typeof updateStats==='function')updateStats();flushAttemptQueue()}
function switchLearner(){activeLearner=null;window.activeLearner=null;loadLearners()}
async function restoreLearner(){const session=await learnerSession();if(!session)return;const{data}=await authClient.from('learners').select('*').order('created_at');const learners=data||[],wanted=localStorage.getItem('wordspring-active-learner'),found=learners.find(l=>l.id===wanted);if(found)selectLearner(found);else renderLearnerPicker(learners)}
function getAttemptQueue(){try{return JSON.parse(localStorage.getItem(attemptQueueKey)||'[]')}catch(e){return[]}}
function setAttemptQueue(q){localStorage.setItem(attemptQueueKey,JSON.stringify(q));window.dispatchEvent(new CustomEvent('wordspring:sync-state',{detail:{pending:q.length}}))}
function makeAttemptId(){return (crypto&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}
async function insertAttempt(item){const session=await learnerSession();if(!session)throw new Error('Not signed in');const payload={owner_id:session.user.id,learner_id:item.learner_id,grade:item.grade,term:item.term,activity_type:item.activity_type,exercise_index:item.exercise_index,correct:item.correct,completed:true,points:item.points,response_text:item.response_text};const{error}=await authClient.from('attempts').insert(payload);if(error)throw error}
async function flushAttemptQueue(){if(attemptSyncing||!navigator.onLine)return;attemptSyncing=true;try{let q=getAttemptQueue();while(q.length){const item=q[0];try{await insertAttempt(item);q.shift();setAttemptQueue(q);window.dispatchEvent(new CustomEvent('wordspring:attempt-saved',{detail:item}))}catch(e){console.warn('Queued attempt still waiting',e);break}}}finally{attemptSyncing=false}}
async function recordCloudAttempt(activityType,exerciseIndex,correct,responseText=''){
  if(!activeLearner)throw new Error('Choose a learner before recording progress');
  const item={client_id:makeAttemptId(),learner_id:activeLearner.id,grade:activeLearner.grade,term:activeLearner.current_term,activity_type:activityType,exercise_index:Number(exerciseIndex)||0,correct:correct===null?null:!!correct,points:correct===true?10:2,response_text:String(responseText||'').slice(0,500),queued_at:new Date().toISOString()};
  const q=getAttemptQueue();q.push(item);setAttemptQueue(q);await flushAttemptQueue();return item
}
window.addEventListener('online',flushAttemptQueue);
window.restoreLearner=restoreLearner;window.recordCloudAttempt=recordCloudAttempt;window.flushAttemptQueue=flushAttemptQueue;window.getPendingAttemptCount=()=>getAttemptQueue().length;
