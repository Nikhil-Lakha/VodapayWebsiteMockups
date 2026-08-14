(function(){
  'use strict';
  const screens=[...document.querySelectorAll('.screen')];
  const back=document.querySelector('.back');
  const state={history:['welcome'],data:{cover:'50000',premium:'79'}};
  const money=value=>'R'+Number(value).toLocaleString('en-ZA').replace(/,/g,' ');
  function show(name,push=true){
    screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
    if(push&&state.history.at(-1)!==name)state.history.push(name);
    back.hidden=['welcome','success'].includes(name);
    document.querySelector('.screen.active h1')?.focus?.();
    document.getElementById('app').focus();window.scrollTo(0,0);
  }
  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.next)));
  back.addEventListener('click',()=>{if(state.history.length>1){state.history.pop();show(state.history.at(-1),false)}});
  function setInvalid(el,bad){const wrap=el.closest('.field,fieldset,.check');wrap?.classList.toggle('invalid',bad);el.setAttribute('aria-invalid',String(bad));return !bad}
  const about=document.getElementById('about-form');
  about.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(about);let ok=true;ok=setInvalid(about.firstName,!d.get('firstName')?.trim())&&ok;ok=setInvalid(about.lastName,!d.get('lastName')?.trim())&&ok;ok=setInvalid(about.idNumber,!/^\d{13}$/.test(d.get('idNumber')||''))&&ok;const radio=about.querySelector('input[name=citizen]');ok=setInvalid(radio,!d.get('citizen'))&&ok;if(!ok){about.querySelector('.invalid input')?.focus();return}Object.assign(state.data,Object.fromEntries(d));show('cover')});
  document.querySelectorAll('.cover-card input').forEach(input=>input.addEventListener('change',()=>{document.querySelectorAll('.cover-card').forEach(c=>c.classList.toggle('selected',c.contains(input)));state.data.cover=input.value;state.data.premium=input.dataset.premium;document.getElementById('premium').innerHTML=`R${input.dataset.premium} <small>/ month</small>`}));
  document.getElementById('cover-form').addEventListener('submit',e=>{e.preventDefault();show('contact')});
  const contact=document.getElementById('contact-form');
  contact.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(contact),mobile=(d.get('mobile')||'').replace(/\s/g,'');let ok=true;ok=setInvalid(contact.mobile,!/^0?[6-8]\d{8}$/.test(mobile))&&ok;ok=setInvalid(contact.email,!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.get('email')||''))&&ok;ok=setInvalid(document.getElementById('consent'),!document.getElementById('consent').checked)&&ok;if(!ok){contact.querySelector('.invalid input')?.focus();return}Object.assign(state.data,Object.fromEntries(d));document.getElementById('summary-name').textContent=`${state.data.firstName} ${state.data.lastName}`;document.getElementById('summary-id').textContent=`•••••••••${state.data.idNumber.slice(-4)}`;document.getElementById('summary-cover').textContent=money(state.data.cover);document.getElementById('summary-premium').textContent=`R${state.data.premium}`;document.getElementById('summary-contact').textContent=`+27 ${mobile.replace(/^0/,'')} · ${state.data.email}`;show('review')});
  document.querySelector('[data-edit]').addEventListener('click',()=>show('about'));
  document.getElementById('submit-application').addEventListener('click',e=>{const btn=e.currentTarget;btn.disabled=true;btn.textContent='Submitting…';setTimeout(()=>{document.getElementById('success-name').textContent=state.data.firstName;document.getElementById('reference').textContent=`VS-${String(Date.now()).slice(-6)}`;show('success');btn.disabled=false;btn.textContent='Submit application'},700)});
  document.getElementById('start-over').addEventListener('click',()=>{about.reset();contact.reset();state.history=['welcome'];show('welcome',false)});
  const dialogs={help:document.getElementById('info-dialog'),terms:document.getElementById('terms-dialog')};
  document.querySelector('[data-open-help]').addEventListener('click',()=>dialogs.help.showModal());document.querySelector('[data-open-terms]').addEventListener('click',()=>dialogs.terms.showModal());document.querySelectorAll('dialog').forEach(d=>d.querySelectorAll('.dialog-close,.dialog-ok').forEach(b=>b.addEventListener('click',()=>d.close())));
  document.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>i.closest('.invalid')?.classList.remove('invalid')));
})();
