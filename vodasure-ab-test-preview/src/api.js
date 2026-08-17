const PROD_API = 'https://api.vodacom.co.za/cloud/';

export const isProductionHost = () => window.location.hostname === 'vodasure.vodacom.co.za';
export const liveEnabled = () => isProductionHost() && new URLSearchParams(window.location.search).get('abLive') === '1';

async function request(path, options = {}) {
  const response = await fetch(PROD_API + path, options);
  if (response.status === 400) return response.json();
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json();
}

const jsonPost = body => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-API-Channel': 'VodacomWeb' },
  body: JSON.stringify(body),
});

export async function dynamicQuotes(data) {
  const body = {
    channelId: data.channelId || 'online',
    msisdn: data.cellphoneNumber,
    coverAmount: Number(data.coverAmount),
    individualAge: Number(data.individualAge || 18),
    includeSpouse: Boolean(data.spouse?.length),
    includeVas: false,
    includeDataReward: false,
    includeMedical: false,
    includeLoyalty: false,
    children: data.children || [],
    dependants: data.extended || [],
  };

  if (liveEnabled()) {
    return request('rest/insurance/funeralcover/dynamic-quotes', jsonPost(body));
  }

  const baseByCover = {10000:49,20000:69,30000:89,40000:109,50000:129};
  const familyExtra = (body.includeSpouse ? 40 : 0) + body.children.length * 18 + body.dependants.length * 25;
  const amount = (baseByCover[body.coverAmount] || 69) + familyExtra;
  return {
    successful: true,
    result: {
      premiumOptions: [{ planName: 'Basic', amount }],
      selectedPremium: { planName: 'Basic', amount, vasBenefit: { included: false, amount: 0 } },
    },
    __preview: true,
  };
}

export async function vodacomCustomerCheck(msisdn) {
  if (!liveEnabled()) return { result: { customerType: 'PREPAID' }, __preview: true };
  return request(`rest/financial-services/product/qualification/account?msisdn=${encodeURIComponent(msisdn)}`);
}

export async function eligibilityCheck(msisdn, idNumber) {
  if (!liveEnabled()) return { result: { haveFuneralCoverPolicy: false, addToBill: true, individualDeceased: false }, __preview: true };
  return request(`rest/financial-services/product/qualification/insurance?msisdn=${encodeURIComponent(msisdn)}&idNumber=${encodeURIComponent(idNumber)}&idType=RSAID&product=FUNERAL&campaign=OnlFun`, {
    headers: { 'X-API-Channel': 'VodacomWeb' },
  });
}

export async function validateBankAccount({ personal, payment }) {
  const body = {
    accountNumber: payment.accountNumber,
    accountType: payment.accountType,
    bankName: payment.bankName,
    branchCode: payment.branchCode,
    idNumber: personal.idNumber,
    surname: payment.accountHolderName,
  };
  if (!liveEnabled()) return { successful: true, result: { valid: true }, __preview: true };
  return request('financial-services/funeral-insurance/order/accountvetting', jsonPost(body));
}

export async function funeralPolicyOrder(state) {
  const { personal, product, family, beneficiary, payment, referralCode } = state;
  const body = {
    funeralCoverCampaign: referralCode ? 'RetailOnline' : 'OnlFun',
    mainClient: {
      firstName: personal.firstName,
      lastName: personal.surname,
      dateOfBirth: (personal.dateOfBirth || '').replace(/-/g, ''),
      cellphoneNumber: personal.cellphoneNumber,
      age: personal.age,
      amount: Number(product.coverAmount),
      idNumber: personal.idNumber,
      funeralCoverMainClientCommunicationDetails: {
        emailAddress: personal.email,
        funeralCoverCommunicationMethod: 'EMAIL',
      },
    },
    ...(family.spouse.length ? {
      spouse: {
        age: family.spouse[0].age,
        dateOfBirth: (family.spouse[0].dateOfBirth || '').replace(/-/g, ''),
        amount: Number(family.spouse[0].coverAmount || product.coverAmount),
        funeralCoverGender: family.spouse[0].gender,
        name: family.spouse[0].firstName,
        lastName: family.spouse[0].surname,
      },
    } : {}),
    children: family.child.map(child => ({
      dateOfBirth: (child.dateOfBirth || '').replace(/-/g, ''),
      amount: Number(product.coverAmount),
      lastName: child.surname,
      name: child.firstName,
      funeralCoverGender: child.gender,
      age: child.age,
    })),
    extendedFamily: family.extended.map(member => ({
      dateOfBirth: (member.dateOfBirth || '').replace(/-/g, ''),
      amount: Number(member.coverAmount || product.coverAmount),
      lastName: member.surname,
      funeralCoverGender: member.gender,
      name: member.firstName,
      age: member.age,
    })),
    funeralCoverPaymentOption: payment.paymentMethod,
    funeralCoverBankingDetails: {
      accountNumber: payment.accountNumber,
      accountType: payment.accountType,
      bankName: payment.bankName,
      branchCode: payment.branchCode,
      debitOrderDate: Number(payment.debitOrderDate || 0),
      nameOfAccountHolder: payment.accountHolderName,
      funeralCoverCommencement: payment.coverStart || null,
    },
    ...(beneficiary.firstName ? {
      funeralCoverBeneficiaryDetails: {
        firstName: beneficiary.firstName,
        gender: beneficiary.gender,
        lastName: beneficiary.surname,
        dateOfBirth: (beneficiary.dateOfBirth || '').replace(/-/g, ''),
        relationship: 'ExtendedFamily',
        extendedRelationship: beneficiary.relationship,
        age: beneficiary.age,
        cellphoneNumber: beneficiary.cellphoneNumber,
      },
    } : {}),
    ...(referralCode ? { lead: [{ campaignCode: 'VodasureLead', leadRefs: [{ refName: 'ReferralCode', refValue: referralCode }] }] } : {}),
    loyaltyBenefit: false,
    medicalAssist: false,
    funeralAssist: false,
    dataRewardBenefit: false,
  };

  if (!liveEnabled()) {
    return {
      successful: true,
      result: {
        header: { date: new Date().toISOString().replace('T',' ').slice(0,19) },
        body: { transactionResult: { resultCode: 'SUCCESS', resultInfo: { policyNumber: 'PREVIEW-0001', description: 'Preview submission', referenceNo: 'ABTEST-PREVIEW' } } },
      },
      __preview: true,
      __payload: body,
    };
  }
  return request('financial-services/funeral-insurance/order', jsonPost(body));
}
