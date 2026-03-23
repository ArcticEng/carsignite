// ═══════════════════════════════════════════════════════════
// CarsIgnite — Express API Server
// Full REST API for members, subscriptions, draws, chat, drives
// ═══════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Members, Subscriptions, Payments, Draws, DrawEntries, Messages, Drives: DrivesDB, 
        Tracking, Notifications, Audit, Analytics, PrizeConfig, DriveGroups, Promoters, Referrals, TIERS } = require('../db/database');
const { generatePaymentData, verifyITN, processITN } = require('./payfast');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'carsignite-dev-secret-change-in-production';

// ═══ Middleware ═══
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3001']
  : ['http://localhost:3001', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', apiLimiter);

// ═══ Auth Middleware ═══
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.member = Members.getById(decoded.id);
    if (!req.member) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

function generateToken(member) {
  return jwt.sign({ id: member.id, email: member.email, tier: member.tier, role: member.role }, JWT_SECRET, { expiresIn: '30d' });
}

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, idNumber, city, province, tier, currentCar, dreamCar, dreamWatch, dreamHouse, promoCode } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!TIERS[tier]) return res.status(400).json({ error: 'Invalid tier' });
    
    const existing = Members.getByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    
    // Validate promo code if provided
    let promoter = null;
    if (promoCode) {
      promoter = Promoters.getByCode(promoCode.trim());
      // Don't block registration if code is invalid — just ignore it
    }

    // Free tier = immediately active, paid tiers = pending until PayFast confirms
    const isFree = tier === 'free';
    const member = Members.create({
      firstName, lastName, email, phone, passwordHash, idNumber, city, province, tier,
      currentCar, dreamCar, dreamWatch, dreamHouse,
      status: isFree ? 'active' : 'pending',
      promoCode: promoter ? promoter.code : null,
      referredBy: promoter ? promoter.id : null,
    });
    const subscription = isFree
      ? Subscriptions.create({ memberId: member.id, tier, status: 'active' })
      : Subscriptions.create({ memberId: member.id, tier });

    // Record referral if promo code was valid
    if (promoter) {
      Referrals.create({
        memberId: member.id, promoterId: promoter.id,
        codeUsed: promoter.code, discountPct: promoter.discount_pct, tier,
      });
      Audit.log('system', 'referral_created', 'member', member.id, { promoter: promoter.name, code: promoter.code });
    }
    
    const token = generateToken(member);
    
    res.status(201).json({
      success: true,
      token,
      member: { ...member, password_hash: undefined },
      subscription,
    });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: e.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = Members.getByEmail(email);
    if (!member) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (member.password_hash && password) {
      const valid = await bcrypt.compare(password, member.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(member);
    Audit.log(member.id, 'login', 'member', member.id, { email: member.email });
    
    res.json({ success: true, token, member: { ...member, password_hash: undefined } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const sub = Subscriptions.getActive(req.member.id);
  res.json({ member: { ...req.member, password_hash: undefined }, subscription: sub });
});

// ═══════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════
app.get('/api/members', auth, (req, res) => {
  const members = Members.getAll(req.query).map(m => ({ ...m, password_hash: undefined, id_number: undefined }));
  res.json({ members, total: members.length });
});

app.get('/api/members/:id', auth, (req, res) => {
  const member = Members.getById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ ...member, password_hash: undefined });
});

app.patch('/api/members/:id', auth, (req, res) => {
  const updated = Members.update(req.params.id, req.body);
  res.json({ success: true, member: { ...updated, password_hash: undefined } });
});

// Admin: manually activate a member's subscription (for testing / manual override)
app.post('/api/admin/members/:id/activate', adminAuth, (req, res) => {
  try {
    const member = Members.getById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    Members.update(req.params.id, { status: 'active' });
    // Also activate their subscription
    const sub = Subscriptions.getByMember(req.params.id)?.[0];
    if (sub) Subscriptions.update(sub.id, { status: 'active' });
    Audit.log(req.member.id, 'member_manually_activated', 'member', req.params.id, { by: req.member.email });
    res.json({ success: true, message: `${member.first_name} ${member.last_name} activated` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: suspend a member
app.post('/api/admin/members/:id/suspend', adminAuth, (req, res) => {
  try {
    const member = Members.getById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    Members.update(req.params.id, { status: 'suspended' });
    const sub = Subscriptions.getByMember(req.params.id)?.[0];
    if (sub) Subscriptions.update(sub.id, { status: 'suspended' });
    Audit.log(req.member.id, 'member_suspended', 'member', req.params.id, { by: req.member.email });
    res.json({ success: true, message: `${member.first_name} ${member.last_name} suspended` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/members/:id', adminAuth, (req, res) => {
  Members.delete(req.params.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════
app.get('/api/subscriptions', auth, (req, res) => {
  const subs = Subscriptions.getAll(req.query);
  res.json({ subscriptions: subs, mrr: Subscriptions.getMRR() });
});

app.get('/api/subscriptions/my', auth, (req, res) => {
  const sub = Subscriptions.getActive(req.member.id);
  res.json({ subscription: sub });
});

app.post('/api/subscriptions/:id/cancel', auth, (req, res) => {
  Subscriptions.cancel(req.params.id);
  res.json({ success: true });
});

app.post('/api/subscriptions/:id/change-tier', auth, (req, res) => {
  const { tier } = req.body;
  if (!TIERS[tier]) return res.status(400).json({ error: 'Invalid tier' });
  Subscriptions.update(req.params.id, { tier, amount: TIERS[tier].price });
  Members.update(req.member.id, { tier });
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════
app.get('/api/payments', auth, (req, res) => {
  const payments = Payments.getAll(parseInt(req.query.limit) || 100);
  res.json({ payments });
});

app.get('/api/payments/my', auth, (req, res) => {
  const payments = Payments.getByMember(req.member.id);
  res.json({ payments });
});

// ═══════════════════════════════════════════
// PAYFAST INTEGRATION
// ═══════════════════════════════════════════
app.post('/api/payfast/generate', auth, (req, res) => {
  try {
    const { tier } = req.body;
    const paymentData = generatePaymentData(req.member, tier || req.member.tier);
    res.json(paymentData);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PayFast ITN callback (no auth — called by PayFast servers)
app.post('/api/payfast/notify', async (req, res) => {
  try {
    // In production, verify ITN signature and source IP
    // const valid = verifyITN(req.body, req.headers);
    // if (!valid) return res.status(403).send('Invalid signature');
    
    const result = await processITN(req.body);
    res.status(200).send('OK');
  } catch (e) {
    console.error('PayFast ITN error:', e);
    res.status(500).send('Error');
  }
});

app.get('/payment/success', (req, res) => {
  res.redirect('/#/payment-success');
});

app.get('/payment/cancel', (req, res) => {
  res.redirect('/#/payment-cancelled');
});

// ═══════════════════════════════════════════
// DRAWS / GIVEAWAYS
// ═══════════════════════════════════════════
app.get('/api/draws', auth, (req, res) => {
  const draws = Draws.getAll(req.query);
  res.json({ draws, total: draws.length });
});

app.get('/api/draws/:id', auth, (req, res) => {
  const draw = Draws.getById(req.params.id);
  if (!draw) return res.status(404).json({ error: 'Draw not found' });
  res.json(draw);
});

app.post('/api/draws/execute', adminAuth, (req, res) => {
  try {
    const { tier } = req.body;
    if (!TIERS[tier]) return res.status(400).json({ error: 'Invalid tier' });
    
    const result = Draws.executeDraw(tier);
    res.json({ success: true, draw: result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/draws/my/wins', auth, (req, res) => {
  const wins = Draws.getByWinner(req.member.id);
  res.json({ wins });
});

// ═══════════════════════════════════════════
// CHAT / MESSAGES
// ═══════════════════════════════════════════
app.get('/api/messages', auth, (req, res) => {
  const channel = req.query.channel || 'general';
  const limit = parseInt(req.query.limit) || 100;
  const messages = Messages.getByChannel(channel, limit);
  res.json({ messages, total: Messages.count(channel) });
});

app.post('/api/messages', auth, (req, res) => {
  const { content, channel } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });
  
  const message = Messages.create({ memberId: req.member.id, content: content.trim(), channel });
  res.status(201).json({ success: true, message });
});

app.delete('/api/messages/:id', auth, (req, res) => {
  Messages.delete(req.params.id);
  res.json({ success: true });
});

app.post('/api/messages/clear', adminAuth, (req, res) => {
  Messages.clearChannel(req.body.channel || 'general');
  res.json({ success: true });
});

// Admin: get all messages (for admin panel)
app.get('/api/admin/messages', adminAuth, (req, res) => {
  const messages = Messages.getAll(parseInt(req.query.limit) || 200);
  res.json({ messages, total: messages.length });
});

// ═══════════════════════════════════════════
// DRIVES / EVENTS
// ═══════════════════════════════════════════
app.get('/api/drives', auth, (req, res) => {
  const drives = DrivesDB.getAll();
  // Add registration status for current user
  const enriched = drives.map(d => ({
    ...d,
    is_registered: DrivesDB.isRegistered(d.id, req.member.id),
  }));
  res.json({ drives: enriched });
});

app.get('/api/drives/upcoming', auth, (req, res) => {
  const drives = DrivesDB.getUpcoming();
  const enriched = drives.map(d => ({
    ...d,
    is_registered: DrivesDB.isRegistered(d.id, req.member.id),
  }));
  res.json({ drives: enriched });
});

app.get('/api/drives/:id', auth, (req, res) => {
  const drive = DrivesDB.getById(req.params.id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });
  drive.is_registered = DrivesDB.isRegistered(drive.id, req.member.id);
  res.json(drive);
});

app.post('/api/drives', adminAuth, (req, res) => {
  const drive = DrivesDB.create(req.body);
  res.status(201).json({ success: true, drive });
});

app.post('/api/drives/:id/register', auth, (req, res) => {
  const result = DrivesDB.register(req.params.id, req.member.id, req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(409).json(result);
  }
});

// ═══════════════════════════════════════════
// LIVE TRACKING
// ═══════════════════════════════════════════
app.post('/api/tracking/position', auth, (req, res) => {
  const { driveId, lat, lng, speed, heading } = req.body;
  const id = Tracking.addPosition({ driveId, memberId: req.member.id, lat, lng, speed, heading });
  res.json({ success: true, id });
});

app.get('/api/tracking/:driveId/positions', auth, (req, res) => {
  const positions = Tracking.getLatestPositions(req.params.driveId);
  res.json({ positions });
});

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════
app.get('/api/notifications', auth, (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const notifications = Notifications.getByMember(req.member.id, unreadOnly);
  res.json({ notifications });
});

app.post('/api/notifications/:id/read', auth, (req, res) => {
  Notifications.markRead(req.params.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', auth, (req, res) => {
  Notifications.markAllRead(req.member.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// ADMIN / ANALYTICS
// ═══════════════════════════════════════════
app.get('/api/admin/analytics', adminAuth, (req, res) => {
  const analytics = Analytics.dashboard();
  res.json(analytics);
});

app.get('/api/admin/audit', adminAuth, (req, res) => {
  const logs = Audit.getAll(parseInt(req.query.limit) || 100);
  res.json({ logs, total: logs.length });
});

// Admin: member preferences/insights for prize decisions
app.get('/api/admin/insights', adminAuth, (req, res) => {
  const db = require('../db/database').getDb();
  const members = db.prepare(`SELECT first_name, last_name, email, tier, current_car, dream_car, dream_watch, dream_house FROM members WHERE role != 'admin' AND (dream_car IS NOT NULL OR dream_watch IS NOT NULL OR dream_house IS NOT NULL)`).all();
  
  // Aggregate top dream items
  const dreamCars = {}; const dreamWatches = {}; const dreamHouses = {};
  members.forEach(m => {
    if (m.dream_car) dreamCars[m.dream_car] = (dreamCars[m.dream_car] || 0) + 1;
    if (m.dream_watch) dreamWatches[m.dream_watch] = (dreamWatches[m.dream_watch] || 0) + 1;
    if (m.dream_house) dreamHouses[m.dream_house] = (dreamHouses[m.dream_house] || 0) + 1;
  });
  
  const sortByCount = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  
  res.json({
    members,
    totals: { withPreferences: members.length },
    topDreamCars: sortByCount(dreamCars).slice(0, 10),
    topDreamWatches: sortByCount(dreamWatches).slice(0, 10),
    topDreamHouses: sortByCount(dreamHouses).slice(0, 10),
  });
});

// ═══════════════════════════════════════════
// PROMO CODES (public validation + admin CRUD)
// ═══════════════════════════════════════════

// Public: validate a promo code (used during signup)
app.get('/api/promo/validate', (req, res) => {
  const code = (req.query.code || '').trim();
  if (!code) return res.status(400).json({ valid: false, error: 'No code provided' });
  const promoter = Promoters.getByCode(code);
  if (!promoter) return res.json({ valid: false });
  res.json({
    valid: true,
    code: promoter.code,
    discountPct: promoter.discount_pct,
    promoterName: promoter.name,
  });
});

// Admin: list all promoters
app.get('/api/admin/promoters', adminAuth, (req, res) => {
  const promoters = Promoters.getAll();
  res.json({ promoters });
});

// Admin: create promoter
app.post('/api/admin/promoters', adminAuth, (req, res) => {
  const { name, instagram, email, phone, code, discountPct, commissionPct, notes } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
  const existing = Promoters.getByCode(code);
  if (existing) return res.status(409).json({ error: `Code "${code.toUpperCase()}" already exists` });
  try {
    const promoter = Promoters.create({ name, instagram, email, phone, code, discountPct, commissionPct, notes });
    res.status(201).json({ success: true, promoter });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: update promoter
app.put('/api/admin/promoters/:id', adminAuth, (req, res) => {
  const promoter = Promoters.update(req.params.id, req.body);
  if (!promoter) return res.status(404).json({ error: 'Promoter not found' });
  res.json({ success: true, promoter });
});

// Admin: delete promoter
app.delete('/api/admin/promoters/:id', adminAuth, (req, res) => {
  Promoters.delete(req.params.id);
  res.json({ success: true });
});

// Admin: view referrals for a promoter
app.get('/api/admin/promoters/:id/referrals', adminAuth, (req, res) => {
  const referrals = Referrals.getByPromoter(req.params.id);
  res.json({ referrals });
});

app.post('/api/admin/reset', adminAuth, (req, res) => {
  // Dangerous! Only for development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }
  const { getDb } = require('../db/database');
  const d = getDb();
  ['tracking_positions','drive_registrations','draw_entries','payments','notifications','audit_log','messages','draws','subscriptions','members','drives'].forEach(t => {
    d.prepare(`DELETE FROM ${t}`).run();
  });
  // Re-seed drives by clearing require cache and re-importing
  delete require.cache[require.resolve('../db/seed')];
  require('../db/seed');
  res.json({ success: true, message: 'Database reset' });
});

// ═══════════════════════════════════════════
// TIER CONFIG (public)
// ═══════════════════════════════════════════
app.get('/api/tiers', (req, res) => {
  res.json({ tiers: TIERS });
});

// Public config (passes safe values to frontend)
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || '',
    payfastSandbox: (process.env.PAYFAST_URL || '').includes('sandbox'),
  });
});

// ═══════════════════════════════════════════
// PRIZE CONFIG (Admin sets prizes per tier)
// ═══════════════════════════════════════════
app.get('/api/prizes', auth, (req, res) => {
  const prizes = PrizeConfig.getAll();
  res.json({ prizes });
});

// Public prize showcase — no auth, used on landing page and member hype page
app.get('/api/prizes/showcase', (req, res) => {
  const { getDb } = require('../db/database');
  const prizes = PrizeConfig.getAll();
  const now = new Date();
  const daysLeft = Math.max(1, Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() - now.getTime()) / 86400000));
  const nextDrawDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
  
  // Entry counts for odds disclosure
  const totalMembers = getDb().prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").get().c;
  const totalEntries = getDb().prepare("SELECT SUM(CASE tier WHEN 'free' THEN 1 WHEN 'ignite' THEN 3 WHEN 'apex' THEN 10 WHEN 'dynasty' THEN 25 ELSE 1 END) as e FROM members WHERE status = 'active'").get().e || 0;

  res.json({
    prizes: prizes.map(p => ({
      tier: p.tier,
      current: { name: p.prize_name, desc: p.prize_desc, value: p.prize_value, image: p.prize_image_url },
      upcoming: { name: p.upcoming_name, desc: p.upcoming_desc, value: p.upcoming_value, image: p.upcoming_image_url },
      drawDateHint: p.draw_date_hint,
    })),
    daysLeft,
    nextDrawDate,
    totalMembers,
    totalEntries,
  });
});

// Public — winner history (no auth required, builds trust & transparency)
app.get('/api/winners', (req, res) => {
  const draws = Draws.getAll(parseInt(req.query.limit) || 50);
  res.json({
    winners: draws.map(d => ({
      winner_name: d.winner_name,
      winner_city: d.winner_city,
      prize_name: d.prize_name,
      prize_value: d.prize_value,
      tier: d.tier,
      draw_date: d.draw_date,
      total_entrants: d.total_entrants,
      total_entries: d.total_entries,
    })),
  });
});

app.post('/api/admin/prizes', adminAuth, (req, res) => {
  const { tier, prizeName, prizeDesc, prizeValue, prizeImageUrl, upcomingName, upcomingDesc, upcomingValue, upcomingImageUrl, drawDateHint } = req.body;
  if (!tier || !prizeName) return res.status(400).json({ error: 'tier and prizeName required' });
  const result = PrizeConfig.set(tier, { prizeName, prizeDesc, prizeValue, prizeImageUrl, upcomingName, upcomingDesc, upcomingValue, upcomingImageUrl, drawDateHint, updatedBy: req.member.id });
  res.json({ success: true, prize: result });
});

// ═══════════════════════════════════════════
// DRIVE GROUPS (Members create/join groups)
// ═══════════════════════════════════════════
app.get('/api/groups/my', auth, (req, res) => {
  const groups = DriveGroups.getByMember(req.member.id);
  res.json({ groups });
});

app.get('/api/groups/:id', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

app.post('/api/groups', auth, (req, res) => {
  const { name, description, emoji, driveId } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name required' });
  const group = DriveGroups.create({ name, description, emoji, driveId, creatorId: req.member.id });
  res.status(201).json({ success: true, group });
});

app.post('/api/groups/join', auth, (req, res) => {
  const { inviteCode } = req.body;
  const group = DriveGroups.getByInviteCode(inviteCode);
  if (!group) return res.status(404).json({ error: 'Invalid invite code' });
  const result = DriveGroups.addMember(group.id, req.member.id);
  if (!result.success) return res.status(409).json(result);
  res.json({ success: true, group: DriveGroups.getById(group.id) });
});

app.get('/api/groups/:id/members', auth, (req, res) => {
  const members = DriveGroups.getMembers(req.params.id);
  res.json({ members });
});

// Group-scoped chat — only group members can read/write
app.get('/api/groups/:id/messages', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isMember = group.members && group.members.some(m => m.member_id === req.member.id);
  if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });
  const channel = 'group_' + req.params.id;
  const messages = Messages.getByChannel(channel, parseInt(req.query.limit) || 100);
  res.json({ messages, total: Messages.count(channel), group: { id: group.id, name: group.name } });
});

app.post('/api/groups/:id/messages', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isMember = group.members && group.members.some(m => m.member_id === req.member.id);
  if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });
  const { content, type, metadata } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Message required' });
  const channel = 'group_' + req.params.id;
  const message = Messages.create({ memberId: req.member.id, content: content.trim(), channel, type: type || 'text', metadata: metadata || null });
  res.status(201).json({ success: true, message });
});

// Group-scoped location sharing — only group members
app.post('/api/groups/:id/location', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isMember = group.members && group.members.some(m => m.member_id === req.member.id);
  if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });
  const { lat, lng, speed, heading } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const id = Tracking.shareGroupLocation({ groupId: req.params.id, memberId: req.member.id, lat, lng, speed, heading });
  res.json({ success: true, id });
});

app.get('/api/groups/:id/locations', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const isMember = group.members && group.members.some(m => m.member_id === req.member.id);
  if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });
  const positions = Tracking.getGroupPositions(req.params.id);
  res.json({ positions, group: { id: group.id, name: group.name, emoji: group.emoji, member_count: group.members.length } });
});

// Delete own message in a group
app.delete('/api/groups/:id/messages/:msgId', auth, (req, res) => {
  const group = DriveGroups.getById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const msg = Messages.getById(req.params.msgId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  // Only the message author can delete their own messages
  if (msg.member_id !== req.member.id) return res.status(403).json({ error: 'You can only delete your own messages' });
  Messages.delete(req.params.msgId);
  Audit.log(req.member.id, 'message_deleted', 'message', req.params.msgId, { groupId: req.params.id });
  res.json({ success: true });
});

// ═══════════════════════════════════════════
// DRAW ENTRIES (Members see their entries)
// ═══════════════════════════════════════════
app.get('/api/draws/my/entries', auth, (req, res) => {
  const tier = TIERS[req.member.tier];
  const sub = Subscriptions.getActive(req.member.id);
  const wins = Draws.getByWinner(req.member.id);
  const prizes = PrizeConfig.getAll();
  const myPrize = prizes.find(p => p.tier === req.member.tier);
  res.json({
    tier: req.member.tier,
    tierName: tier?.name,
    entriesPerCycle: tier?.entries || 0,
    frequency: tier?.freq,
    subscriptionActive: sub?.status === 'active',
    nextBilling: sub?.next_billing,
    currentPrize: myPrize || { prize_name: tier?.prize, prize_desc: '', prize_value: tier?.prizeValue },
    totalWins: wins.length,
    wins,
  });
});

// ═══ Catch-all: serve frontend ═══
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ═══ Seed DB before starting ═══
require('../db/seed');

// ═══ Start ═══
app.listen(PORT, () => {
  console.log(`
  ═══════════════════════════════════════
   🏎️  CarsIgnite Server
   ───────────────────────────────────────
   URL:      http://localhost:${PORT}
   Env:      ${process.env.NODE_ENV || 'development'}
   Database: SQLite (${process.env.DB_PATH || 'db/carsignite.db'})
   PayFast:  ${process.env.PAYFAST_URL?.includes('sandbox') ? 'Sandbox' : 'Production'}
  ═══════════════════════════════════════
  `);
});

module.exports = app;
