// ═══════════════════════════════════════════════════════════
// CarsIgnite — PayFast Integration
// Based on PayFast's required field ordering spec
// Docs: https://developers.payfast.co.za
// ═══════════════════════════════════════════════════════════

const crypto = require('crypto');
const { Subscriptions, Payments, Members, Audit, TIERS, Referrals, Promoters } = require('../db/database');

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'jt7NOE43FZPn';
const PAYFAST_SANDBOX = (process.env.PAYFAST_URL || 'sandbox').includes('sandbox');
const PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_VALIDATE_URL = process.env.PAYFAST_VALIDATE_URL || 'https://sandbox.payfast.co.za/eng/query/validate';
const PAYFAST_RETURN_URL = process.env.PAYFAST_RETURN_URL || 'http://localhost:3001/payment/success';
const PAYFAST_CANCEL_URL = process.env.PAYFAST_CANCEL_URL || 'http://localhost:3001/payment/cancel';
const PAYFAST_NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || 'http://localhost:3000/api/payfast/notify';

// PayFast REQUIRES this exact field order for signature generation
const FIELD_ORDER = [
  'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
  'name_first', 'name_last', 'email_address', 'cell_number',
  'm_payment_id', 'amount', 'item_name', 'item_description',
  'custom_int1', 'custom_int2', 'custom_int3', 'custom_int4', 'custom_int5',
  'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5',
  'email_confirmation', 'confirmation_address', 'payment_method',
  'subscription_type', 'billing_date', 'recurring_amount', 'frequency', 'cycles',
];

/**
 * Generate PayFast MD5 signature.
 * CRITICAL: Fields must be in PayFast's required order.
 * Empty values must be excluded. Passphrase only appended if non-empty.
 */
function generateSignature(data, passphrase) {
  // Build priority map from FIELD_ORDER
  const fieldPriority = {};
  FIELD_ORDER.forEach((k, i) => { fieldPriority[k] = i; });

  // Sort keys by PayFast's required order
  const sortedKeys = Object.keys(data).sort((a, b) => {
    const pa = fieldPriority[a] !== undefined ? fieldPriority[a] : 999;
    const pb = fieldPriority[b] !== undefined ? fieldPriority[b] : 999;
    return pa - pb;
  });

  // Build param string — skip empty values and 'signature' key
  const parts = [];
  for (const key of sortedKeys) {
    const val = String(data[key]).trim();
    if (val && key !== 'signature') {
      parts.push(`${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`);
    }
  }

  let paramString = parts.join('&');

  // Append passphrase if set
  if (passphrase && passphrase.trim()) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
}

/**
 * Get the 1st of next month in Y-m-d format (PayFast requirement)
 */
function getNextBillingDate() {
  const today = new Date();
  const month = today.getMonth() + 1; // 0-indexed
  if (month === 12) {
    return `${today.getFullYear() + 1}-01-01`;
  }
  return `${today.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`;
}

/**
 * Generate PayFast payment form data for subscription
 */
function generatePaymentData(member, tier) {
  const tierConfig = TIERS[tier];
  if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);

  const phone = (member.phone || '').replace(/[^0-9]/g, '');

  // Check for promo code discount (wrapped in try/catch for safety)
  let price = tierConfig.price;
  let discountApplied = 0;
  try {
    const referral = Referrals.getByMember(member.id);
    if (referral && referral.discount_pct > 0) {
      discountApplied = referral.discount_pct;
      price = Math.round(price * (1 - discountApplied / 100) * 100) / 100;
      console.log(`[PayFast] Promo ${referral.promoter_code} applied: ${discountApplied}% off -> R${price}`);
    }
  } catch (e) {
    console.log('[PayFast] Referral lookup skipped:', e.message);
  }

  const data = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: PAYFAST_RETURN_URL,
    cancel_url: PAYFAST_CANCEL_URL,
    notify_url: PAYFAST_NOTIFY_URL,
    name_first: member.first_name,
    name_last: member.last_name,
    email_address: member.email,
    m_payment_id: `CI${Date.now()}`,
    amount: price.toFixed(2),
    item_name: `CarsIgnite ${tierConfig.name}`,
    custom_str1: member.id,
    custom_str2: tier,
    subscription_type: '1',
    billing_date: getNextBillingDate(),
    recurring_amount: price.toFixed(2),
    frequency: '3',
    cycles: '0',
  };

  // Only add cell_number if valid (10+ digits)
  if (phone && phone.length >= 10) {
    data.cell_number = phone;
  }

  // Generate signature with field ordering
  const signature = generateSignature(data, PAYFAST_PASSPHRASE);
  data.signature = signature;

  console.log('[PayFast] Checkout generated for', member.email, '| tier:', tier, '| amount: R' + data.amount);

  return {
    data, url: PAYFAST_URL,
    discount: discountApplied > 0 ? { pct: discountApplied, originalPrice: tierConfig.price, finalPrice: price } : null,
  };
}

/**
 * Verify PayFast ITN signature
 */
function verifyITN(postData) {
  const dataCopy = {};
  for (const [k, v] of Object.entries(postData)) {
    if (k !== 'signature') dataCopy[k] = v;
  }
  const expectedSig = generateSignature(dataCopy, PAYFAST_PASSPHRASE);
  return postData.signature === expectedSig;
}

/**
 * Process PayFast ITN callback
 */
async function processITN(body) {
  const memberId = body.custom_str1;
  const tier = body.custom_str2;
  const paymentStatus = body.payment_status;

  if (!memberId) throw new Error('Missing member ID in ITN');

  Audit.log('payfast', 'itn_received', 'payment', body.m_payment_id, {
    status: paymentStatus, amount: body.amount_gross, memberId
  });

  console.log(`[PayFast ITN] status=${paymentStatus} tier=${tier} memberId=${memberId} amount=R${body.amount_gross}`);

  if (paymentStatus === 'COMPLETE') {
    const subs = Subscriptions.getByMember(memberId);
    let sub = subs.find(s => s.status === 'active') || subs.find(s => s.status === 'pending') || subs[0];

    if (!sub) {
      sub = Subscriptions.create({
        memberId, tier, status: 'active',
        payfastToken: body.token || null,
        payfastSubId: body.m_payment_id,
      });
    } else {
      Subscriptions.update(sub.id, {
        status: 'active',
        tier: tier,
        amount: TIERS[tier] ? TIERS[tier].price : sub.amount,
        payfast_token: body.token || sub.payfast_token,
        payfast_sub_id: body.m_payment_id || sub.payfast_sub_id,
        last_payment: new Date().toISOString(),
        next_billing: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        failed_attempts: 0,
      });
    }

    Payments.create({
      subscriptionId: sub.id, memberId,
      amount: parseFloat(body.amount_gross),
      status: 'completed',
      payfastPaymentId: body.pf_payment_id,
      payfastRef: body.m_payment_id,
      method: body.payment_method || 'card',
    });

    // Update member status AND tier (critical for free → paid upgrades)
    Members.update(memberId, { status: 'active', tier: tier });

    // Mark referral as converted + credit promoter
    try {
      const referral = Referrals.getByMember(memberId);
      if (referral && !referral.converted) {
        Referrals.markConverted(memberId);
        Promoters.incrementReferral(referral.promoter_id, parseFloat(body.amount_gross));
        console.log(`[PayFast] Referral converted for promoter ${referral.promoter_id}`);
      }
    } catch (e) {
      console.log('[PayFast] Referral conversion skipped:', e.message);
    }

    console.log(`[PayFast] Activated member ${memberId} on tier: ${tier}`);
    return { success: true, action: 'payment_recorded' };
  }

  if (paymentStatus === 'FAILED') {
    const subs = Subscriptions.getByMember(memberId);
    const sub = subs.find(s => s.status === 'active' || s.status === 'pending');
    if (sub) {
      const attempts = (sub.failed_attempts || 0) + 1;
      Subscriptions.update(sub.id, { failed_attempts: attempts });
      if (attempts >= 3) {
        Subscriptions.update(sub.id, { status: 'failed' });
        Members.update(memberId, { status: 'suspended' });
      }
    }
    return { success: true, action: 'payment_failed' };
  }

  if (paymentStatus === 'CANCELLED') {
    const subs = Subscriptions.getByMember(memberId);
    const sub = subs.find(s => s.status === 'active' || s.status === 'pending');
    if (sub) Subscriptions.update(sub.id, { status: 'cancelled', cancelled_at: new Date().toISOString() });
    Members.update(memberId, { status: 'cancelled' });
    return { success: true, action: 'subscription_cancelled' };
  }

  return { success: true, action: 'no_action' };
}

module.exports = {
  PAYFAST: { merchantId: PAYFAST_MERCHANT_ID, merchantKey: PAYFAST_MERCHANT_KEY, processUrl: PAYFAST_URL },
  generatePaymentData,
  verifyITN,
  processITN,
};
