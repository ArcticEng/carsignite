// ═══════════════════════════════════════════════════════════
// CarsIgnite — PayFast Integration
// Handles subscription creation, ITN callbacks, tokenization
// Docs: https://developers.payfast.co.za
// ═══════════════════════════════════════════════════════════

const crypto = require('crypto');
const { Subscriptions, Payments, Members, Audit, TIERS } = require('../db/database');

const PAYFAST = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  processUrl: process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process',
  validateUrl: process.env.PAYFAST_VALIDATE_URL || 'https://sandbox.payfast.co.za/eng/query/validate',
  returnUrl: process.env.PAYFAST_RETURN_URL || 'http://localhost:3001/payment/success',
  cancelUrl: process.env.PAYFAST_CANCEL_URL || 'http://localhost:3001/payment/cancel',
  notifyUrl: process.env.PAYFAST_NOTIFY_URL || 'http://localhost:3000/api/payfast/notify',
};

// Valid PayFast source IPs (for ITN verification)
const PAYFAST_IPS = [
  '197.97.145.144/28', '41.74.179.192/27',  // Production
  '197.97.145.145', '197.97.145.146', '197.97.145.147',
  '41.74.179.193', '41.74.179.194', '41.74.179.195',
];

/**
 * Generate PayFast payment form data for subscription
 */
function generatePaymentData(member, tier) {
  const tierConfig = TIERS[tier];
  if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);

  const data = {
    merchant_id: PAYFAST.merchantId,
    merchant_key: PAYFAST.merchantKey,
    return_url: PAYFAST.returnUrl,
    cancel_url: PAYFAST.cancelUrl,
    notify_url: PAYFAST.notifyUrl,
    name_first: member.first_name,
    name_last: member.last_name,
    email_address: member.email,
    cell_number: member.phone?.replace(/[^0-9]/g, ''),
    m_payment_id: `CI-${member.id.slice(0,8)}-${Date.now()}`,
    amount: tierConfig.price.toFixed(2),
    item_name: `CarsIgnite ${tierConfig.name} Membership`,
    item_description: `Monthly ${tierConfig.name} tier subscription - GPS tracking, group chat, events`,
    // Recurring billing
    subscription_type: '1',  // 1 = subscription
    billing_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    recurring_amount: tierConfig.price.toFixed(2),
    frequency: '3',  // 3 = monthly
    cycles: '0',     // 0 = indefinite
    // Custom fields
    custom_str1: member.id,
    custom_str2: tier,
    custom_int1: tierConfig.entries.toString(),
  };

  // Generate signature
  const signatureString = Object.keys(data)
    .filter(k => data[k] !== '' && data[k] !== undefined)
    .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, '+')}`)
    .join('&');

  const fullString = PAYFAST.passphrase
    ? `${signatureString}&passphrase=${encodeURIComponent(PAYFAST.passphrase)}`
    : signatureString;

  data.signature = crypto.createHash('md5').update(fullString).digest('hex');

  return { data, url: PAYFAST.processUrl };
}

/**
 * Verify PayFast ITN (Instant Transaction Notification)
 */
function verifyITN(body, headers) {
  // 1. Verify source IP (in production)
  // 2. Verify signature
  const received = { ...body };
  const receivedSig = received.signature;
  delete received.signature;

  const paramString = Object.keys(received)
    .filter(k => received[k] !== '')
    .map(k => `${k}=${encodeURIComponent(received[k]).replace(/%20/g, '+')}`)
    .join('&');

  const fullString = PAYFAST.passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST.passphrase)}`
    : paramString;

  const computedSig = crypto.createHash('md5').update(fullString).digest('hex');

  return computedSig === receivedSig;
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

  if (paymentStatus === 'COMPLETE') {
    // Find existing subscription (active or pending) or create new one
    const subs = Subscriptions.getByMember(memberId);
    let sub = subs.find(s => s.status === 'active') || subs.find(s => s.status === 'pending') || subs[0];
    if (!sub) {
      sub = Subscriptions.create({
        memberId, tier,
        status: 'active',
        payfastToken: body.token || null,
        payfastSubId: body.m_payment_id,
      });
    } else {
      Subscriptions.update(sub.id, {
        status: 'active',
        payfast_token: body.token || sub.payfast_token,
        payfast_sub_id: body.m_payment_id || sub.payfast_sub_id,
        last_payment: new Date().toISOString(),
        next_billing: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        failed_attempts: 0,
      });
    }

    // Record payment
    Payments.create({
      subscriptionId: sub.id,
      memberId,
      amount: parseFloat(body.amount_gross),
      status: 'completed',
      payfastPaymentId: body.pf_payment_id,
      payfastRef: body.m_payment_id,
      method: body.payment_method || 'card',
    });

    // Ensure member is active
    Members.update(memberId, { status: 'active' });

    return { success: true, action: 'payment_recorded' };
  }

  if (paymentStatus === 'FAILED') {
    const sub = Subscriptions.getActive(memberId);
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
    const sub = Subscriptions.getActive(memberId);
    if (sub) Subscriptions.cancel(sub.id);
    Members.update(memberId, { status: 'cancelled' });
    return { success: true, action: 'subscription_cancelled' };
  }

  return { success: true, action: 'no_action' };
}

module.exports = { PAYFAST, generatePaymentData, verifyITN, processITN };
