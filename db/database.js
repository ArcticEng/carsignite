// ═══════════════════════════════════════════════════════════
// CarsIgnite — Database Access Layer
// SQLite3 with full CRUD for all tables
// ═══════════════════════════════════════════════════════════

const Database = require('better-sqlite3');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'carsignite.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);
  }
  return db;
}

// ═══ TIER CONFIG ═══
const TIERS = {
  free:    { name: 'FREE',    price: 0,   entries: 1,  freq: 'monthly',   prize: 'Monthly Draw',  prizeValue: 0 },
  ignite:  { name: 'IGNITE',  price: 49,  entries: 3,  freq: 'monthly',   prize: 'Luxury Watch',  prizeValue: 25000 },
  apex:    { name: 'APEX',    price: 99,  entries: 10, freq: 'monthly',   prize: 'Supercar',      prizeValue: 2500000 },
  dynasty: { name: 'DYNASTY', price: 899, entries: 25, freq: 'quarterly', prize: 'Luxury Home',   prizeValue: 4200000 },
};

// ═══════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════
const Members = {
  create(data) {
    const d = getDb();
    const id = uuid();
    d.prepare(`
      INSERT INTO members (id, first_name, last_name, email, phone, password_hash, id_number, city, province, tier, role, status, current_car, dream_car, dream_watch, dream_house, promo_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.firstName, data.lastName, data.email.toLowerCase(), data.phone, data.passwordHash || null,
           data.idNumber || null, data.city || null, data.province || 'gauteng', data.tier, data.role || 'member', data.status || 'pending',
           data.currentCar || null, data.dreamCar || null, data.dreamWatch || null, data.dreamHouse || null,
           data.promoCode || null, data.referredBy || null);
    
    Audit.log('system', 'member_created', 'member', id, { email: data.email, tier: data.tier });
    return this.getById(id);
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM members WHERE id = ?').get(id);
  },

  getByEmail(email) {
    return getDb().prepare('SELECT * FROM members WHERE email = ?').get(email.toLowerCase());
  },

  getAll(filters = {}) {
    let q = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    if (filters.tier) { q += ' AND tier = ?'; params.push(filters.tier); }
    if (filters.status) { q += ' AND status = ?'; params.push(filters.status); }
    q += ' ORDER BY created_at DESC';
    if (filters.limit) { q += ' LIMIT ?'; params.push(filters.limit); }
    return getDb().prepare(q).all(...params);
  },

  update(id, data) {
    const sets = []; const vals = [];
    const allowed = ['first_name','last_name','phone','city','province','tier','role','status','avatar_url','current_car','dream_car','dream_watch','dream_house'];
    for (const [k,v] of Object.entries(data)) {
      if (allowed.includes(k)) { sets.push(`${k} = ?`); vals.push(v); }
    }
    if (sets.length === 0) return this.getById(id);
    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    getDb().prepare(`UPDATE members SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    Audit.log('system', 'member_updated', 'member', id, { fields: Object.keys(data) });
    return this.getById(id);
  },

  delete(id) {
    const member = this.getById(id);
    getDb().prepare('DELETE FROM members WHERE id = ?').run(id);
    if (member) Audit.log('system', 'member_deleted', 'member', id, { email: member.email });
    return member;
  },

  count(filters = {}) {
    let q = 'SELECT COUNT(*) as count FROM members WHERE 1=1';
    const params = [];
    if (filters.tier) { q += ' AND tier = ?'; params.push(filters.tier); }
    if (filters.status) { q += ' AND status = ?'; params.push(filters.status); }
    return getDb().prepare(q).get(...params).count;
  },

  getByTier(tier) {
    return getDb().prepare("SELECT * FROM members WHERE tier = ? AND status = 'active'").all(tier);
  },
};

// ═══════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════
const Subscriptions = {
  create(data) {
    const d = getDb();
    const id = uuid();
    const tier = TIERS[data.tier];
    const nextBilling = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    
    d.prepare(`
      INSERT INTO subscriptions (id, member_id, tier, amount, frequency, status, payfast_token, payfast_sub_id, next_billing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.memberId, data.tier, tier.price, tier.freq,
           data.status || 'pending',
           data.payfastToken || null,
           data.payfastSubId || null,
           nextBilling);
    
    Audit.log('system', 'subscription_created', 'subscription', id, { memberId: data.memberId, tier: data.tier, amount: tier.price });
    return this.getById(id);
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
  },

  getByMember(memberId) {
    return getDb().prepare('SELECT * FROM subscriptions WHERE member_id = ? ORDER BY created_at DESC').all(memberId);
  },

  getActive(memberId) {
    return getDb().prepare("SELECT * FROM subscriptions WHERE member_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(memberId);
  },

  getAll(filters = {}) {
    let q = 'SELECT s.*, m.first_name, m.last_name, m.email FROM subscriptions s JOIN members m ON s.member_id = m.id WHERE 1=1';
    const params = [];
    if (filters.status) { q += ' AND s.status = ?'; params.push(filters.status); }
    q += ' ORDER BY s.created_at DESC';
    return getDb().prepare(q).all(...params);
  },

  update(id, data) {
    const sets = []; const vals = [];
    for (const [k,v] of Object.entries(data)) {
      sets.push(`${k} = ?`); vals.push(v);
    }
    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    getDb().prepare(`UPDATE subscriptions SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id);
  },

  cancel(id) {
    return this.update(id, { status: 'cancelled', cancelled_at: new Date().toISOString() });
  },

  getMRR() {
    const r = getDb().prepare("SELECT SUM(amount) as mrr FROM subscriptions WHERE status = 'active'").get();
    return r?.mrr || 0;
  },
};

// ═══════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════
const Payments = {
  create(data) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO payments (id, subscription_id, member_id, amount, status, payfast_payment_id, payfast_ref, method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.subscriptionId, data.memberId, data.amount, data.status || 'completed',
           data.payfastPaymentId || null, data.payfastRef || null, data.method || 'card');
    Audit.log('payfast', 'payment_received', 'payment', id, { memberId: data.memberId, amount: data.amount });
    return getDb().prepare('SELECT * FROM payments WHERE id = ?').get(id);
  },

  getByMember(memberId) {
    return getDb().prepare('SELECT * FROM payments WHERE member_id = ? ORDER BY created_at DESC').all(memberId);
  },

  getAll(limit = 100) {
    return getDb().prepare('SELECT p.*, m.first_name, m.last_name FROM payments p JOIN members m ON p.member_id = m.id ORDER BY p.created_at DESC LIMIT ?').all(limit);
  },
};

// ═══════════════════════════════════════════
// DRAWS
// ═══════════════════════════════════════════
const Draws = {
  create(data) {
    const id = uuid();
    const auditRef = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    
    getDb().prepare(`
      INSERT INTO draws (id, tier, prize_name, prize_desc, prize_value, winner_id, winner_name, winner_email, winner_phone, winner_city,
                         total_entrants, total_entries, draw_method, random_seed, audit_ref, auditor_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.tier, data.prizeName, data.prizeDesc || null, data.prizeValue || 0,
           data.winnerId, data.winnerName, data.winnerEmail, data.winnerPhone || null, data.winnerCity || null,
           data.totalEntrants, data.totalEntries, 'weighted_random', data.randomSeed || null,
           auditRef, 'Independent Auditor');
    
    // Create notification for winner
    Notifications.create(data.winnerId, `🎉 Congratulations! You won the ${data.prizeName}!`,
      `You've been selected as the winner of the ${TIERS[data.tier]?.name || data.tier} tier giveaway. Prize: ${data.prizeName}`,
      'draw');
    
    Audit.log('system', 'draw_completed', 'draw', id, {
      tier: data.tier, winnerId: data.winnerId, winnerName: data.winnerName,
      prize: data.prizeName, entrants: data.totalEntrants, entries: data.totalEntries, auditRef
    });
    
    return getDb().prepare('SELECT * FROM draws WHERE id = ?').get(id);
  },

  getAll(filters = {}) {
    let q = 'SELECT * FROM draws WHERE 1=1';
    const params = [];
    if (filters.tier) { q += ' AND tier = ?'; params.push(filters.tier); }
    q += ' ORDER BY draw_date DESC';
    if (filters.limit) { q += ' LIMIT ?'; params.push(filters.limit); }
    return getDb().prepare(q).all(...params);
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM draws WHERE id = ?').get(id);
  },

  getByWinner(memberId) {
    return getDb().prepare('SELECT * FROM draws WHERE winner_id = ? ORDER BY draw_date DESC').all(memberId);
  },

  // Execute a weighted random draw for a tier
  executeDraw(tier) {
    const tierConfig = TIERS[tier];
    if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);

    const members = Members.getByTier(tier);
    if (members.length === 0) throw new Error(`No active members in ${tier} tier`);

    // Build weighted pool
    const pool = [];
    members.forEach(m => {
      for (let i = 0; i < tierConfig.entries; i++) pool.push(m);
    });

    // Cryptographically random selection
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32BE(0) % pool.length;
    const winner = pool[randomIndex];

    return this.create({
      tier,
      prizeName: tierConfig.prize,
      prizeDesc: `${tierConfig.name} tier ${tierConfig.freq} giveaway`,
      prizeValue: tierConfig.prizeValue,
      winnerId: winner.id,
      winnerName: `${winner.first_name} ${winner.last_name}`,
      winnerEmail: winner.email,
      winnerPhone: winner.phone,
      winnerCity: winner.city,
      totalEntrants: members.length,
      totalEntries: pool.length,
      randomSeed: randomBytes.toString('hex'),
    });
  },
};

// ═══════════════════════════════════════════
// DRAW ENTRIES
// ═══════════════════════════════════════════
const DrawEntries = {
  addEntries(memberId, tier, cycle) {
    const id = uuid();
    const tierConfig = TIERS[tier];
    getDb().prepare(`
      INSERT INTO draw_entries (id, member_id, tier, entries_count, cycle)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, memberId, tier, tierConfig?.entries || 1, cycle);
    return getDb().prepare('SELECT * FROM draw_entries WHERE id = ?').get(id);
  },

  getByMember(memberId) {
    return getDb().prepare('SELECT * FROM draw_entries WHERE member_id = ? ORDER BY created_at DESC').all(memberId);
  },

  getByCycle(cycle) {
    return getDb().prepare('SELECT * FROM draw_entries WHERE cycle = ?').all(cycle);
  },
};

// ═══════════════════════════════════════════
// MESSAGES (Chat)
// ═══════════════════════════════════════════
const Messages = {
  create(data) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO messages (id, member_id, channel, content, message_type, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.memberId, data.channel || 'general', data.content, data.type || 'text', data.metadata ? JSON.stringify(data.metadata) : null);
    
    return getDb().prepare(`
      SELECT m.*, mb.first_name, mb.last_name, mb.tier, mb.avatar_url
      FROM messages m JOIN members mb ON m.member_id = mb.id
      WHERE m.id = ?
    `).get(id);
  },

  getByChannel(channel = 'general', limit = 100, before = null) {
    if (before) {
      return getDb().prepare(`
        SELECT m.*, mb.first_name, mb.last_name, mb.tier, mb.avatar_url
        FROM messages m JOIN members mb ON m.member_id = mb.id
        WHERE m.channel = ? AND m.deleted = 0 AND m.created_at < ?
        ORDER BY m.created_at DESC LIMIT ?
      `).all(channel, before, limit).reverse();
    }
    return getDb().prepare(`
      SELECT m.*, mb.first_name, mb.last_name, mb.tier, mb.avatar_url
      FROM messages m JOIN members mb ON m.member_id = mb.id
      WHERE m.channel = ? AND m.deleted = 0
      ORDER BY m.created_at DESC LIMIT ?
    `).all(channel, limit).reverse();
  },

  getAll(limit = 200) {
    return getDb().prepare(`
      SELECT m.*, mb.first_name, mb.last_name, mb.tier
      FROM messages m JOIN members mb ON m.member_id = mb.id
      WHERE m.deleted = 0 ORDER BY m.created_at DESC LIMIT ?
    `).all(limit);
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM messages WHERE id = ?').get(id);
  },

  delete(id) {
    getDb().prepare('UPDATE messages SET deleted = 1 WHERE id = ?').run(id);
  },

  clearChannel(channel = 'general') {
    getDb().prepare('UPDATE messages SET deleted = 1 WHERE channel = ?').run(channel);
    Audit.log('admin', 'chat_cleared', 'channel', channel, {});
  },

  count(channel = 'general') {
    return getDb().prepare('SELECT COUNT(*) as count FROM messages WHERE channel = ? AND deleted = 0').get(channel).count;
  },
};

// ═══════════════════════════════════════════
// DRIVES
// ═══════════════════════════════════════════
const Drives = {
  create(data) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO drives (id, name, description, drive_type, date, start_time, start_location, end_location, distance, max_cars, tier_required)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.description || null, data.driveType || 'rally',
           data.date, data.startTime || null, data.startLocation || null, data.endLocation || null,
           data.distance || null, data.maxCars || 50, data.tierRequired || null);
    Audit.log('admin', 'drive_created', 'drive', id, { name: data.name, date: data.date });
    return this.getById(id);
  },

  getById(id) {
    const drive = getDb().prepare('SELECT * FROM drives WHERE id = ?').get(id);
    if (drive) {
      drive.registrations = getDb().prepare(`
        SELECT dr.*, m.first_name, m.last_name, m.tier
        FROM drive_registrations dr JOIN members m ON dr.member_id = m.id
        WHERE dr.drive_id = ?
      `).all(id);
      drive.registration_count = drive.registrations.length;
    }
    return drive;
  },

  getAll() {
    const drives = getDb().prepare('SELECT * FROM drives ORDER BY date ASC').all();
    return drives.map(d => {
      d.registration_count = getDb().prepare('SELECT COUNT(*) as c FROM drive_registrations WHERE drive_id = ?').get(d.id).c;
      return d;
    });
  },

  getUpcoming() {
    const today = new Date().toISOString().slice(0, 10);
    const drives = getDb().prepare("SELECT * FROM drives WHERE date >= ? AND status = 'upcoming' ORDER BY date ASC").all(today);
    return drives.map(d => {
      d.registration_count = getDb().prepare('SELECT COUNT(*) as c FROM drive_registrations WHERE drive_id = ?').get(d.id).c;
      return d;
    });
  },

  register(driveId, memberId, carData = {}) {
    const id = uuid();
    try {
      getDb().prepare(`
        INSERT INTO drive_registrations (id, drive_id, member_id, car_make, car_model, car_year, car_color)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, driveId, memberId, carData.make || null, carData.model || null, carData.year || null, carData.color || null);
      Audit.log(memberId, 'drive_registered', 'drive', driveId, { memberId });
      return { success: true, id };
    } catch (e) {
      if (e.message.includes('UNIQUE')) return { success: false, error: 'Already registered' };
      throw e;
    }
  },

  isRegistered(driveId, memberId) {
    return !!getDb().prepare('SELECT 1 FROM drive_registrations WHERE drive_id = ? AND member_id = ?').get(driveId, memberId);
  },
};

// ═══════════════════════════════════════════
// TRACKING
// ═══════════════════════════════════════════
const Tracking = {
  addPosition(data) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO tracking_positions (id, drive_id, member_id, latitude, longitude, speed, heading, altitude, accuracy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.driveId, data.memberId, data.lat, data.lng, data.speed || 0, data.heading || 0, data.alt || 0, data.accuracy || 0);
    return id;
  },

  getLatestPositions(driveId) {
    return getDb().prepare(`
      SELECT tp.*, m.first_name, m.last_name, m.tier
      FROM tracking_positions tp
      JOIN members m ON tp.member_id = m.id
      WHERE tp.drive_id = ? AND tp.id IN (
        SELECT id FROM tracking_positions t2
        WHERE t2.drive_id = tp.drive_id AND t2.member_id = tp.member_id
        ORDER BY t2.recorded_at DESC LIMIT 1
      )
    `).all(driveId);
  },

  // Group-scoped location sharing
  shareGroupLocation(data) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO tracking_positions (id, group_id, member_id, latitude, longitude, speed, heading, altitude, accuracy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.groupId, data.memberId, data.lat, data.lng, data.speed || 0, data.heading || 0, data.alt || 0, data.accuracy || 0);
    return id;
  },

  getGroupPositions(groupId) {
    return getDb().prepare(`
      SELECT tp.*, m.first_name, m.last_name, m.tier, m.city
      FROM tracking_positions tp
      JOIN members m ON tp.member_id = m.id
      WHERE tp.group_id = ? 
        AND tp.recorded_at > datetime('now', '-30 minutes')
        AND tp.id IN (
          SELECT t2.id FROM tracking_positions t2
          WHERE t2.group_id = tp.group_id AND t2.member_id = tp.member_id
          ORDER BY t2.recorded_at DESC LIMIT 1
        )
    `).all(groupId);
  },
};

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════
const Notifications = {
  create(memberId, title, body, type = 'info') {
    const id = uuid();
    getDb().prepare('INSERT INTO notifications (id, member_id, title, body, type) VALUES (?, ?, ?, ?, ?)').run(id, memberId, title, body, type);
    return id;
  },

  getByMember(memberId, unreadOnly = false) {
    const q = unreadOnly
      ? 'SELECT * FROM notifications WHERE member_id = ? AND read = 0 ORDER BY created_at DESC'
      : 'SELECT * FROM notifications WHERE member_id = ? ORDER BY created_at DESC LIMIT 50';
    return getDb().prepare(q).all(memberId);
  },

  markRead(id) {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
  },

  markAllRead(memberId) {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE member_id = ?').run(memberId);
  },
};

// ═══════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════
const Audit = {
  log(actorId, action, resourceType, resourceId, details, meta = {}) {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO audit_log (id, actor_id, actor_type, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorId, meta.actorType || 'system', action, resourceType, resourceId,
           JSON.stringify(details), meta.ip || null, meta.ua || null);
  },

  getAll(limit = 100) {
    return getDb().prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').all(limit);
  },

  getByActor(actorId, limit = 50) {
    return getDb().prepare('SELECT * FROM audit_log WHERE actor_id = ? ORDER BY created_at DESC LIMIT ?').all(actorId, limit);
  },

  getByAction(action, limit = 50) {
    return getDb().prepare('SELECT * FROM audit_log WHERE action = ? ORDER BY created_at DESC LIMIT ?').all(action, limit);
  },
};

// ═══════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════
const Analytics = {
  dashboard() {
    const d = getDb();
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    
    return {
      members: {
        total: d.prepare('SELECT COUNT(*) as c FROM members').get().c,
        active: d.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'active'").get().c,
        byTier: {
          ignite: d.prepare("SELECT COUNT(*) as c FROM members WHERE tier = 'ignite' AND status = 'active' AND role != 'admin'").get().c,
          apex: d.prepare("SELECT COUNT(*) as c FROM members WHERE tier = 'apex' AND status = 'active' AND role != 'admin'").get().c,
          dynasty: d.prepare("SELECT COUNT(*) as c FROM members WHERE tier = 'dynasty' AND status = 'active' AND role != 'admin'").get().c,
        },
        newThisMonth: d.prepare('SELECT COUNT(*) as c FROM members WHERE created_at >= ?').get(`${thisMonth}-01`).c,
      },
      revenue: {
        mrr: Subscriptions.getMRR(),
        arr: Subscriptions.getMRR() * 12,
        activeSubs: d.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'").get().c,
        totalPayments: d.prepare("SELECT COUNT(*) as c FROM payments WHERE status = 'completed'").get().c,
        totalRevenue: d.prepare("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE status = 'completed'").get().s,
      },
      draws: {
        total: d.prepare('SELECT COUNT(*) as c FROM draws').get().c,
        totalPrizeValue: d.prepare('SELECT COALESCE(SUM(prize_value),0) as s FROM draws').get().s,
      },
      engagement: {
        messages: d.prepare('SELECT COUNT(*) as c FROM messages WHERE deleted = 0').get().c,
        drives: d.prepare('SELECT COUNT(*) as c FROM drives').get().c,
        driveRegs: d.prepare('SELECT COUNT(*) as c FROM drive_registrations').get().c,
      },
      auditLogs: d.prepare('SELECT COUNT(*) as c FROM audit_log').get().c,
    };
  },
};

// ═══════════════════════════════════════════
// PRIZE CONFIG (Admin-configurable)
// ═══════════════════════════════════════════
const PrizeConfig = {
  get(tier) {
    return getDb().prepare('SELECT * FROM prize_config WHERE tier = ?').get(tier);
  },
  getAll() {
    return getDb().prepare('SELECT * FROM prize_config ORDER BY tier').all();
  },
  set(tier, data) {
    const existing = this.get(tier);
    if (existing) {
      getDb().prepare('UPDATE prize_config SET prize_name=?, prize_desc=?, prize_value=?, prize_image_url=?, upcoming_name=?, upcoming_desc=?, upcoming_value=?, upcoming_image_url=?, draw_date_hint=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE tier=?')
        .run(data.prizeName, data.prizeDesc||null, data.prizeValue||0, data.prizeImageUrl||null, data.upcomingName||existing.upcoming_name||null, data.upcomingDesc||existing.upcoming_desc||null, data.upcomingValue||existing.upcoming_value||0, data.upcomingImageUrl||existing.upcoming_image_url||null, data.drawDateHint||existing.draw_date_hint||null, data.updatedBy||null, tier);
    } else {
      const id = uuid();
      getDb().prepare('INSERT INTO prize_config (id, tier, prize_name, prize_desc, prize_value, prize_image_url, upcoming_name, upcoming_desc, upcoming_value, upcoming_image_url, draw_date_hint, updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, tier, data.prizeName, data.prizeDesc||null, data.prizeValue||0, data.prizeImageUrl||null, data.upcomingName||null, data.upcomingDesc||null, data.upcomingValue||0, data.upcomingImageUrl||null, data.drawDateHint||null, data.updatedBy||null);
    }
    Audit.log(data.updatedBy||'admin', 'prize_config_updated', 'prize_config', tier, { prizeName: data.prizeName, prizeValue: data.prizeValue });
    return this.get(tier);
  },
  initDefaults() {
    if (!this.get('ignite')) this.set('ignite', { prizeName:'Luxury Watch', prizeDesc:'TAG Heuer, Omega, Breitling', prizeValue:25000 });
    if (!this.get('apex')) this.set('apex', { prizeName:'Supercar', prizeDesc:'Porsche, Ferrari, Lamborghini', prizeValue:2500000 });
    if (!this.get('dynasty')) this.set('dynasty', { prizeName:'Luxury Home', prizeDesc:'Premium SA property', prizeValue:4200000 });
  },
};

// ═══════════════════════════════════════════
// DRIVE GROUPS (Member-created)
// ═══════════════════════════════════════════
const DriveGroups = {
  create(data) {
    const id = uuid();
    const inviteCode = Math.random().toString(36).slice(2,8).toUpperCase();
    getDb().prepare('INSERT INTO drive_groups (id, name, description, emoji, drive_id, creator_id, invite_code) VALUES (?,?,?,?,?,?,?)')
      .run(id, data.name, data.description||null, data.emoji||'🏎️', data.driveId||null, data.creatorId, inviteCode);
    // Auto-add creator
    this.addMember(id, data.creatorId);
    Audit.log(data.creatorId, 'group_created', 'drive_group', id, { name: data.name, inviteCode });
    return this.getById(id);
  },
  getById(id) {
    const g = getDb().prepare('SELECT * FROM drive_groups WHERE id = ?').get(id);
    if (g) g.members = getDb().prepare(`SELECT dgm.*, m.first_name, m.last_name, m.tier FROM drive_group_members dgm JOIN members m ON dgm.member_id = m.id WHERE dgm.group_id = ?`).all(id);
    return g;
  },
  getByMember(memberId) {
    return getDb().prepare(`SELECT dg.*, (SELECT COUNT(*) FROM drive_group_members WHERE group_id=dg.id) as member_count FROM drive_groups dg WHERE dg.id IN (SELECT group_id FROM drive_group_members WHERE member_id=?)`).all(memberId);
  },
  getByInviteCode(code) {
    return getDb().prepare('SELECT * FROM drive_groups WHERE invite_code = ?').get(code);
  },
  addMember(groupId, memberId) {
    const id = uuid();
    try {
      getDb().prepare('INSERT INTO drive_group_members (id, group_id, member_id) VALUES (?,?,?)').run(id, groupId, memberId);
      return { success: true };
    } catch(e) {
      if (e.message.includes('UNIQUE')) return { success: false, error: 'Already in group' };
      throw e;
    }
  },
  getMembers(groupId) {
    return getDb().prepare(`SELECT dgm.*, m.first_name, m.last_name, m.tier, m.city FROM drive_group_members dgm JOIN members m ON dgm.member_id = m.id WHERE dgm.group_id = ?`).all(groupId);
  },
};

// ═══════════════════════════════════════════
// PROMOTERS (Instagram influencer referral codes)
// ═══════════════════════════════════════════
const Promoters = {
  create(data) {
    const d = getDb();
    const id = uuid();
    d.prepare(`INSERT INTO promoters (id, name, instagram, email, phone, code, discount_pct, commission_pct, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, data.name, data.instagram || null, data.email || null, data.phone || null,
           data.code.toUpperCase(), data.discountPct || 10, data.commissionPct || 5, data.notes || null);
    Audit.log('system', 'promoter_created', 'promoter', id, { code: data.code, name: data.name });
    return this.getById(id);
  },
  getById(id) { return getDb().prepare('SELECT * FROM promoters WHERE id = ?').get(id); },
  getByCode(code) { return getDb().prepare('SELECT * FROM promoters WHERE code = ? COLLATE NOCASE AND status = \'active\'').get(code); },
  getAll() { return getDb().prepare('SELECT * FROM promoters ORDER BY created_at DESC').all(); },
  update(id, data) {
    const sets = []; const vals = [];
    const allowed = ['name','instagram','email','phone','code','discount_pct','commission_pct','status','notes'];
    for (const [k,v] of Object.entries(data)) {
      if (allowed.includes(k)) { sets.push(`${k} = ?`); vals.push(k === 'code' ? String(v).toUpperCase() : v); }
    }
    if (sets.length === 0) return this.getById(id);
    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    getDb().prepare(`UPDATE promoters SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    return this.getById(id);
  },
  delete(id) { getDb().prepare('DELETE FROM promoters WHERE id = ?').run(id); },
  incrementReferral(id, amount) {
    const p = this.getById(id);
    if (!p) return;
    const commission = amount * (p.commission_pct / 100);
    getDb().prepare('UPDATE promoters SET total_referrals = total_referrals + 1, total_revenue = total_revenue + ?, total_commission = total_commission + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(amount, commission, id);
  },
};

// ═══════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════
const Referrals = {
  create(data) {
    const d = getDb();
    const id = uuid();
    d.prepare(`INSERT INTO referrals (id, member_id, promoter_id, code_used, discount_pct, tier_at_signup)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, data.memberId, data.promoterId, data.codeUsed, data.discountPct, data.tier || 'free');
    return this.getById(id);
  },
  getById(id) { return getDb().prepare('SELECT * FROM referrals WHERE id = ?').get(id); },
  getByMember(memberId) { return getDb().prepare('SELECT r.*, p.name as promoter_name, p.code as promoter_code FROM referrals r JOIN promoters p ON r.promoter_id = p.id WHERE r.member_id = ?').get(memberId); },
  getByPromoter(promoterId) {
    return getDb().prepare(`SELECT r.*, m.first_name, m.last_name, m.email, m.tier, m.status
      FROM referrals r JOIN members m ON r.member_id = m.id WHERE r.promoter_id = ? ORDER BY r.created_at DESC`).all(promoterId);
  },
  markConverted(memberId) {
    getDb().prepare('UPDATE referrals SET converted = 1, converted_at = CURRENT_TIMESTAMP WHERE member_id = ? AND converted = 0').run(memberId);
  },
};

module.exports = { getDb, TIERS, Members, Subscriptions, Payments, Draws, DrawEntries, Messages, Drives, Tracking, Notifications, Audit, Analytics, PrizeConfig, DriveGroups, Promoters, Referrals };
