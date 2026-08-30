const SB_URL='https://tlqqawiaoqbfxvqhnpof.supabase.co';
const SB_KEY='sb_publishable_krM_1Ow_BWVYsWRwzN--pw_6QMmvb7B';
const authClient=window.supabase.createClient(SB_URL,SB_KEY);
let authMode='login';
function setAuthMode(mode){
  authMode=mode;
  const signup=mode==='signup';
  const confirmWrap=document.getElementById('confirmWrap');
  const confirmInput=document.getElementById('authConfirm');
  document.getElementById('authTitle').textContent=signup?'Create your WordSpring account':'Welcome back';
  document.getElementById('authIntro').textContent=signup?'Sign up with your email address and choose a password.':'Enter your email address and password to continue.';
  document.getElementById('authSubmit').textContent=signup?'Create account':'Log in';
  confirmWrap.classList.toggle('hidden',!signup);
  confirmInput.required=signup;
  confirmInput.disabled=!signup;
  if(!signup)confirmInput.value='';
  document.getElementById('loginTab').classList.toggle('active',!signup);
  document.getElementById('signupTab').classList.toggle('active',signup);
  document.getElementById('forgotButton').classList.toggle('hidden',signup);
  document.getElementById('authPassword').autocomplete=signup?'new-password':'current-password';
  message('');
}
async function submitAuth(e){
  e.preventDefault();
  const email=document.getElementById('authEmail').value.trim();
  const password=document.getElementById('authPassword').value;
  const confirm=document.getElementById('authConfirm').value;
  message('Please wait...');
  if(authMode==='signup'){
    if(password!==confirm){message('Passwords do not match.',true);return}
    const {data,error}=await authClient.auth.signUp({email,password,options:{emailRedirectTo:'https://sootheit.co.za/'}});
    if(error){message(error.message,true);return}
    if(data.session){showApp(data.user)}else message('Account created. Check your email and confirm your address before logging in.');
  }else{
    const {data,error}=await authClient.auth.signInWithPassword({email,password});
    if(error){message('Unable to log in. Check your email, password and email confirmation.',true);return}
    showApp(data.user);
  }
}
async function forgotPassword(){
  const email=document.getElementById('authEmail').value.trim();
  if(!email){message('Enter your email address first.',true);return}
  const {error}=await authClient.auth.resetPasswordForEmail(email,{redirectTo:'https://sootheit.co.za/'});
  message(error?error.message:'Password reset email sent.',!!error);
}
async function logout(){
  await authClient.auth.signOut();
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('authPassword').value='';
  setAuthMode('login');
}
function showApp(user){
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  document.getElementById('userEmail').textContent=user?.email||'';
  if(typeof updateStats==='function')updateStats();
}
function message(text,bad=false){const el=document.getElementById('authMessage');el.textContent=text;el.style.color=bad?'#b42318':'#17824b'}
authClient.auth.getSession().then(({data})=>{if(data.session)showApp(data.session.user);else setAuthMode('login')});
authClient.auth.onAuthStateChange((_event,session)=>{if(session)showApp(session.user)});
setAuthMode('login');