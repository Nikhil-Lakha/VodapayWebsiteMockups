const KEY = 'vodasure-ab-application';

export const initialState = {
  personal: { firstName:'', surname:'', dateOfBirth:'', cellphoneNumber:'', email:'', idNumber:'', age:18 },
  product: { coverType:'individualCover', coverAmount:20000, basePremium:0, totalPremium:0 },
  family: { spouse:[], child:[], extended:[] },
  beneficiary: { firstName:'', surname:'', dateOfBirth:'', gender:'', relationship:'', cellphoneNumber:'', age:18 },
  payment: { paymentMethod:'', accountNumber:'', accountType:'', bankName:'', branchCode:'', debitOrderDate:'', accountHolderName:'', coverStart:'', agreeToTerms:false },
  premiumOptions: [], isAddToBill:false, isVodacomCustomer:false, referralCode:'',
};

export function loadState(){
  try { return { ...structuredClone(initialState), ...(JSON.parse(sessionStorage.getItem(KEY) || 'null') || {}) }; }
  catch { return structuredClone(initialState); }
}
export function saveState(state){ sessionStorage.setItem(KEY, JSON.stringify(state)); }
export function clearState(){ sessionStorage.removeItem(KEY); }
export function calcAge(dob){
  if(!dob) return 18;
  const d=new Date(dob), n=new Date(); let age=n.getFullYear()-d.getFullYear();
  const m=n.getMonth()-d.getMonth(); if(m<0 || (m===0 && n.getDate()<d.getDate())) age--; return age;
}
