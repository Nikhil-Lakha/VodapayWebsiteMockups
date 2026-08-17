import './styles.css';
import { loadState, saveState, clearState, calcAge } from './state.js';
import { dynamicQuotes, vodacomCustomerCheck, eligibilityCheck, validateBankAccount, funeralPolicyOrder, liveEnabled } from './api.js';

const app = document.querySelector('#app');
let state = loadState();
let busy = false;
let message = '';

const PREVIEW_BASE = '/VodapayWebsiteMockups/vodasure-ab-test-preview';
const routes = ['/cover-details','/quote','/personal-details','/family-details','/beneficiary','/payment/details','/payment/debit-order','/payment/summary','/confirmation'];
const cleanPath = () => {
  const p = location.pathname.startsWith(PREVIEW_BASE) ? location.pathname.slice(PREVIEW_BASE.length) : location.pathname.replace('/funeral-cover','');
  return p || '/cover-details';
};
const routeIndex = () => Math.max(0, routes.indexOf(cleanPath()));
const basePath = location.pathname.startsWith(PREVIEW_BASE) ? PREVIEW_BASE : (location.pathname.startsWith('/funeral-cover/') ? '/funeral-cover' : '');
const pathFor = p => basePath + p;

function go(path){ history.pushState({},'',pathFor(path)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
window.addEventListener('popstate', render);

function esc(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function field(label,name,value,type='text',extra=''){return `<div class="field"><label>${label}</label><input name="${name}" value="${esc(value||'')}" type="${type}" ${extra}></div>`}
function select(label,name,value,options){return `<div class="field"><label>${label}</label><select name="${name}">${options.map(o=>`<option value="${esc(o)}" ${o===value?'selected':''}>${esc(o||'Select')}</option>`).join('')}</select></div>`}
function card(content, cls=''){ return `<section class="card ${cls}">${content}</section>`; }
function actions(back,next,nextText='Continue',disabled=false){return `<div class="actions"><div class="actions-inner"><button class="btn secondary" id="backBtn">${back?'Back':'Exit'}</button><button class="btn primary" id="nextBtn" ${disabled?'disabled':''}>${busy?'Please wait…':nextText}</button></div></div>`}
function shell(content){const idx=routeIndex(); return `<div class="shell"><header class="topbar"><div class="brand"><div class="brandmark">V</div><span>VodaSure Funeral Cover</span></div>${liveEnabled()?'<div class="preview-pill">Live API mode</div>':'<div class="preview-pill">Preview — no real policy submission</div>'}</header><div class="progress">${routes.slice(0,8).map((_,i)=>`<span class="${i<=idx?'active':''}"></span>`).join('')}</div><main class="page">${content}${message?`<div class="${message.startsWith('Error')?'error':'notice'}">${esc(message)}</div>`:''}</main></div>`}
function syncForm(selector, target){ const form=document.querySelector(selector); if(!form)return; new FormData(form).forEach((v,k)=>target[k]=v); saveState(state); }
function bindCommon(backPath, nextHandler){document.querySelector('#backBtn')?.addEventListener('click',()=>backPath?go(backPath):history.back());document.querySelector('#nextBtn')?.addEventListener('click',nextHandler);}

async function recalcQuote(){
  busy=true; message=''; render();
  try{
    const p=state.personal;
    const quote=await dynamicQuotes({channelId:state.referralCode?'vodacom':'online',cellphoneNumber:p.cellphoneNumber,coverAmount:state.product.coverAmount,individualAge:calcAge(p.dateOfBirth),spouse:state.family.spouse.map(m=>({coverAmount:Number(m.coverAmount||state.product.coverAmount),age:calcAge(m.dateOfBirth)})),children:state.family.child.map(m=>({coverAmount:Number(m.coverAmount||state.product.coverAmount),age:calcAge(m.dateOfBirth)})),extended:state.family.extended.map(m=>({coverAmount:Number(m.coverAmount||state.product.coverAmount),age:calcAge(m.dateOfBirth)}))});
    state.premiumOptions=quote.result?.premiumOptions||[];
    state.product.basePremium=Number(state.premiumOptions.find(x=>x.planName==='Basic')?.amount||quote.result?.selectedPremium?.amount||0);
    state.product.totalPremium=Number(quote.result?.selectedPremium?.amount||state.product.basePremium||0);
    saveState(state);
  }catch(e){message='Error generating quote. '+e.message;}
  busy=false;
}

function coverPage(){
 const p=state.personal; const family=state.product.coverType==='familyCover';
 app.innerHTML=shell(card(`<div class="eyebrow">Step 1 · Choose cover</div><h1 class="title">Cover that fits your life</h1><p class="subtitle">Tell us who you want to cover and choose your preferred cover amount.</p><div class="choice-grid"><div class="choice ${!family?'active':''}" data-type="individualCover"><h3>Just me</h3><p>Funeral cover for your life only.</p></div><div class="choice ${family?'active':''}" data-type="familyCover"><h3>Me & my family</h3><p>Add spouse, children or extended family.</p></div></div><h3 style="margin-top:28px">Cover amount</h3><div class="amounts">${[10000,20000,30000,40000,50000].map(a=>`<button class="amount ${Number(state.product.coverAmount)===a?'active':''}" data-amount="${a}">R${a/1000}k</button>`).join('')}</div>`, 'hero-card')+card(`<h2>About you</h2><p class="subtitle">These details are used to request your quote. Fields start blank.</p><form id="quickForm" class="fields">${field('First name','firstName',p.firstName)}${field('Surname','surname',p.surname)}${field('Date of birth','dateOfBirth',p.dateOfBirth,'date')}${field('Cellphone number','cellphoneNumber',p.cellphoneNumber,'tel')}</form>`)+actions(false,true,'Get my quote',busy));
 document.querySelectorAll('[data-type]').forEach(el=>el.onclick=()=>{state.product.coverType=el.dataset.type;saveState(state);render();});
 document.querySelectorAll('[data-amount]').forEach(el=>el.onclick=()=>{state.product.coverAmount=Number(el.dataset.amount);saveState(state);render();});
 bindCommon(null,async()=>{syncForm('#quickForm',state.personal); if(!state.personal.firstName||!state.personal.surname||!state.personal.dateOfBirth||!state.personal.cellphoneNumber){message='Please complete all four fields to continue.';render();return;} state.personal.age=calcAge(state.personal.dateOfBirth); try{busy=true;render();const cc=await vodacomCustomerCheck(state.personal.cellphoneNumber.replace(/\D/g,''));state.isVodacomCustomer=Boolean(cc.result?.customerType);await recalcQuote();go('/quote');}catch(e){busy=false;message='Error requesting your quote. '+e.message;render();}});
}

function quotePage(){
 app.innerHTML=shell(card(`<div class="eyebrow">Your quote</div><div class="quote"><div><h1 class="title">Here’s your monthly premium</h1><p class="cover-note">${state.product.coverType==='familyCover'?'Family cover':'Individual cover'} · R${Number(state.product.coverAmount).toLocaleString()} cover</p></div><div class="premium">R${Number(state.product.totalPremium||0).toFixed(2)} <small>/month</small></div></div><div class="notice">Premium is supplied by the existing <strong>dynamic-quotes</strong> contract in live A/B mode.</div>`)+actions('/cover-details',true,'Accept quote'));
 bindCommon('/cover-details',()=>go('/personal-details'));
}

function personalPage(){
 const p=state.personal;
 app.innerHTML=shell(card(`<div class="eyebrow">Step 2 · Personal details</div><h1 class="title">Create your policy</h1><p class="subtitle">Confirm your details and add the information needed for the application.</p><form id="personalForm" class="fields">${field('First name','firstName',p.firstName)}${field('Surname','surname',p.surname)}${field('Date of birth','dateOfBirth',p.dateOfBirth,'date')}${field('Cellphone number','cellphoneNumber',p.cellphoneNumber,'tel')}${field('Email address','email',p.email,'email')}${field('RSA ID number','idNumber',p.idNumber)}</form>`)+actions('/quote',true,'Continue',busy));
 bindCommon('/quote',async()=>{syncForm('#personalForm',state.personal);state.personal.age=calcAge(state.personal.dateOfBirth);if(!state.personal.email||!state.personal.idNumber){message='Please enter your email address and ID number.';render();return;}busy=true;render();try{const r=await eligibilityCheck(state.personal.cellphoneNumber.replace(/\D/g,''),state.personal.idNumber.replace(/\s/g,''));state.isAddToBill=Boolean(r.result?.addToBill);if(r.result?.haveFuneralCoverPolicy){message='Error: an existing Funeral Cover policy was returned by the eligibility service.';busy=false;render();return;}if(r.result?.individualDeceased){message='Error: identity verification could not continue.';busy=false;render();return;}saveState(state);busy=false;go(state.product.coverType==='familyCover'?'/family-details':'/beneficiary');}catch(e){busy=false;message='Error checking eligibility. '+e.message;render();}});
}

function memberBlock(type,label,member,index){return `<div class="member"><div class="member-head"><strong>${label} ${index+1}</strong><button class="linkbtn remove" data-remove="${type}:${index}">Remove</button></div><div class="fields" style="margin-top:12px">${field('First name',`${type}.${index}.firstName`,member.firstName)}${field('Surname',`${type}.${index}.surname`,member.surname)}${field('Date of birth',`${type}.${index}.dateOfBirth`,member.dateOfBirth,'date')}${select('Gender',`${type}.${index}.gender`,member.gender||'', ['', 'Male','Female'])}${type==='extended'?select('Cover amount',`${type}.${index}.coverAmount`,String(member.coverAmount||state.product.coverAmount),['10000','20000','30000','40000','50000']):''}</div></div>`}
function parseFamilyForm(){const form=document.querySelector('#familyForm');if(!form)return;const fd=new FormData(form);for(const [key,val] of fd.entries()){const [type,i,prop]=key.split('.');if(!state.family[type][Number(i)])continue;state.family[type][Number(i)][prop]=val;}['spouse','child','extended'].forEach(type=>state.family[type].forEach(m=>{m.age=calcAge(m.dateOfBirth);if(!m.coverAmount)m.coverAmount=state.product.coverAmount;}));saveState(state);}
function familyPage(){
 const f=state.family; app.innerHTML=shell(card(`<div class="eyebrow">Step 3 · Family</div><h1 class="title">Who else should be covered?</h1><p class="subtitle">Add only the family members you want included.</p><form id="familyForm">${f.spouse.map((m,i)=>memberBlock('spouse','Spouse',m,i)).join('')}${f.child.map((m,i)=>memberBlock('child','Child',m,i)).join('')}${f.extended.map((m,i)=>memberBlock('extended','Extended family',m,i)).join('')}</form><div style="display:flex;gap:18px;flex-wrap:wrap"><button class="linkbtn" data-add="spouse">+ Add spouse</button><button class="linkbtn" data-add="child">+ Add child</button><button class="linkbtn" data-add="extended">+ Add extended family</button></div>`)+actions('/personal-details',true,'Update family quote',busy));
 document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{parseFamilyForm();const type=b.dataset.add;if(type==='spouse'&&state.family.spouse.length)return;state.family[type].push({firstName:'',surname:'',dateOfBirth:'',gender:'',coverAmount:state.product.coverAmount,age:18});saveState(state);render();});
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{parseFamilyForm();const [t,i]=b.dataset.remove.split(':');state.family[t].splice(Number(i),1);saveState(state);render();});
 bindCommon('/personal-details',async()=>{parseFamilyForm();busy=true;render();await recalcQuote();busy=false;go('/beneficiary');});
}

function beneficiaryPage(){const b=state.beneficiary;app.innerHTML=shell(card(`<div class="eyebrow">Beneficiary</div><h1 class="title">Who should receive the benefit?</h1><p class="subtitle">Add your nominated beneficiary details.</p><form id="beneficiaryForm" class="fields">${field('First name','firstName',b.firstName)}${field('Surname','surname',b.surname)}${field('Date of birth','dateOfBirth',b.dateOfBirth,'date')}${select('Gender','gender',b.gender||'', ['', 'Male','Female'])}${select('Relationship','relationship',b.relationship||'', ['', 'Spouse','Child','Parent','Sibling','Other'])}${field('Cellphone number','cellphoneNumber',b.cellphoneNumber,'tel')}</form>`)+actions(state.product.coverType==='familyCover'?'/family-details':'/personal-details',true,'Continue'));
 bindCommon(state.product.coverType==='familyCover'?'/family-details':'/personal-details',()=>{syncForm('#beneficiaryForm',state.beneficiary);state.beneficiary.age=calcAge(state.beneficiary.dateOfBirth);if(!state.beneficiary.firstName||!state.beneficiary.surname){message='Please complete the beneficiary details.';render();return;}go('/payment/details');});}

function paymentChoicePage(){app.innerHTML=shell(card(`<div class="eyebrow">Payment</div><h1 class="title">How would you like to pay?</h1><p class="subtitle">Choose the payment method for your monthly premium.</p><div class="payment-options"><div class="pay-option ${state.payment.paymentMethod==='ADD_TO_BILL'?'active':''}" data-pay="ADD_TO_BILL"><h3>Add to bill</h3><p>Charge the premium to your Vodacom account where eligible.</p>${!state.isAddToBill?'<small>Eligibility depends on the existing backend response.</small>':''}</div><div class="pay-option ${state.payment.paymentMethod==='DEBIT_ORDER'?'active':''}" data-pay="DEBIT_ORDER"><h3>Debit order</h3><p>Pay monthly from your bank account.</p></div></div>`)+actions('/beneficiary',true,'Continue',!state.payment.paymentMethod));document.querySelectorAll('[data-pay]').forEach(el=>el.onclick=()=>{state.payment.paymentMethod=el.dataset.pay;saveState(state);render();});bindCommon('/beneficiary',()=>{if(state.payment.paymentMethod==='ADD_TO_BILL'){state.payment.coverStart='';saveState(state);go('/payment/summary');}else go('/payment/debit-order');});}

function debitPage(){const p=state.payment;app.innerHTML=shell(card(`<div class="eyebrow">Debit order</div><h1 class="title">Banking details</h1><p class="subtitle">Enter the account details that should be used for the monthly premium.</p><form id="debitForm" class="fields">${field('Account holder','accountHolderName',p.accountHolderName)}${field('Account number','accountNumber',p.accountNumber)}${select('Account type','accountType',p.accountType||'', ['', 'Cheque','Savings','Transmission'])}${select('Bank','bankName',p.bankName||'', ['', 'ABSA','FNB','Nedbank','Standard Bank','Capitec','African Bank'])}${field('Branch code','branchCode',p.branchCode)}${select('Debit order date','debitOrderDate',String(p.debitOrderDate||''),['','1','15','20','25','28'])}</form>`)+actions('/payment/details',true,'Continue',busy));bindCommon('/payment/details',async()=>{syncForm('#debitForm',state.payment);busy=true;render();try{await validateBankAccount(state);busy=false;go('/payment/summary');}catch(e){busy=false;message='Error validating bank details. '+e.message;render();}});}

function summaryPage(){const pr=state.product,p=state.personal;app.innerHTML=shell(card(`<div class="eyebrow">Payment summary</div><h1 class="title">Review and buy</h1><p class="subtitle">Check the policy details before submitting the application.</p><div class="summary-row"><span>Policyholder</span><strong>${esc(p.firstName)} ${esc(p.surname)}</strong></div><div class="summary-row"><span>Cover</span><strong>R${Number(pr.coverAmount).toLocaleString()}</strong></div><div class="summary-row"><span>Monthly premium</span><strong>R${Number(pr.totalPremium).toFixed(2)}</strong></div><div class="summary-row"><span>Plan</span><strong>${pr.coverType==='familyCover'?'Me & my family':'Just me'}</strong></div><div class="summary-row"><span>Payment</span><strong>${state.payment.paymentMethod==='ADD_TO_BILL'?'Add to bill':'Debit order'}</strong></div><label style="display:flex;gap:10px;margin-top:22px"><input type="checkbox" id="terms" ${state.payment.agreeToTerms?'checked':''}> <span>I agree to the Terms & Conditions and Privacy Policy.</span></label>`)+actions('/payment/details',true,'Buy now',!state.payment.agreeToTerms||busy));document.querySelector('#terms').onchange=e=>{state.payment.agreeToTerms=e.target.checked;saveState(state);render();};bindCommon('/payment/details',async()=>{busy=true;render();try{const r=await funeralPolicyOrder(state);const code=r.result?.body?.transactionResult?.resultCode;if(code==='SUCCESS'){state.submission=r;saveState(state);busy=false;go('/confirmation');return;}busy=false;message='Error: the policy order did not return SUCCESS.';render();}catch(e){busy=false;message='Error submitting policy. '+e.message;render();}});}

function confirmationPage(){const policy=state.submission?.result?.body?.transactionResult?.resultInfo?.policyNumber||'—';app.innerHTML=shell(card(`<div class="center"><div class="tick">✓</div><div class="eyebrow">Application successful</div><h1 class="title">You’re covered</h1><p class="subtitle">The existing policy-order contract returned SUCCESS.</p><div class="summary-row"><span>Policy number</span><strong>${esc(policy)}</strong></div><div class="summary-row"><span>Monthly premium</span><strong>R${Number(state.product.totalPremium).toFixed(2)}</strong></div><button class="btn primary" id="restart" style="margin-top:24px">Start again</button></div>`));document.querySelector('#restart').onclick=()=>{clearState();state=loadState();go('/cover-details');};}

function render(){message=message||'';let path=cleanPath();if(path==='/'||!routes.includes(path))path='/cover-details';({
 '/cover-details':coverPage,'/quote':quotePage,'/personal-details':personalPage,'/family-details':familyPage,'/beneficiary':beneficiaryPage,'/payment/details':paymentChoicePage,'/payment/debit-order':debitPage,'/payment/summary':summaryPage,'/confirmation':confirmationPage,
}[path]||coverPage)();}

render();
