-- ═══════════════════════════════════════════════════════════
-- CarsIgnite Database Schema
-- SQLite3 — Full production schema
-- ═══════════════════════════════════════════════════════════

-- Members table — core user data
CREATE TABLE IF NOT EXISTS members (
    id              TEXT PRIMARY KEY,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    phone           TEXT NOT NULL,
    password_hash   TEXT,
    id_number       TEXT,
    city            TEXT,
    province        TEXT NOT NULL DEFAULT 'gauteng',
    tier            TEXT NOT NULL CHECK(tier IN ('free','ignite','apex','dynasty')),
    role            TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('active','pending','paused','cancelled','suspended')),
    avatar_url      TEXT,
    current_car     TEXT,
    dream_car       TEXT,
    dream_watch     TEXT,
    dream_house     TEXT,
    promo_code      TEXT,
    referred_by     TEXT REFERENCES promoters(id),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table — PayFast recurring billing
CREATE TABLE IF NOT EXISTS subscriptions (
    id              TEXT PRIMARY KEY,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    tier            TEXT NOT NULL CHECK(tier IN ('free','ignite','apex','dynasty')),
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'ZAR',
    frequency       TEXT NOT NULL DEFAULT 'monthly' CHECK(frequency IN ('monthly','quarterly','annual')),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('active','pending','paused','cancelled','failed')),
    payfast_token   TEXT,
    payfast_sub_id  TEXT,
    next_billing    DATE,
    last_payment    DATETIME,
    failed_attempts INTEGER DEFAULT 0,
    start_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at    DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table — individual transaction records
CREATE TABLE IF NOT EXISTS payments (
    id              TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
    member_id       TEXT NOT NULL REFERENCES members(id),
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'ZAR',
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
    payfast_payment_id TEXT,
    payfast_ref     TEXT,
    method          TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Draw entries — accumulating entries per member per draw cycle
CREATE TABLE IF NOT EXISTS draw_entries (
    id              TEXT PRIMARY KEY,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    draw_id         TEXT REFERENCES draws(id),
    tier            TEXT NOT NULL,
    entries_count   INTEGER NOT NULL DEFAULT 1,
    cycle           TEXT NOT NULL,  -- e.g. '2026-03' for monthly, '2026-Q1' for quarterly
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Draws table — completed giveaway draws
CREATE TABLE IF NOT EXISTS draws (
    id              TEXT PRIMARY KEY,
    tier            TEXT NOT NULL CHECK(tier IN ('free','ignite','apex','dynasty')),
    prize_name      TEXT NOT NULL,
    prize_desc      TEXT,
    prize_value     REAL DEFAULT 0,
    winner_id       TEXT REFERENCES members(id),
    winner_name     TEXT,
    winner_email    TEXT,
    winner_phone    TEXT,
    winner_city     TEXT,
    total_entrants  INTEGER NOT NULL DEFAULT 0,
    total_entries   INTEGER NOT NULL DEFAULT 0,
    draw_method     TEXT DEFAULT 'weighted_random',
    random_seed     TEXT,
    status          TEXT DEFAULT 'completed' CHECK(status IN ('scheduled','in_progress','completed','voided')),
    audited         INTEGER DEFAULT 1,
    audit_ref       TEXT,
    auditor_name    TEXT DEFAULT 'Independent Auditor',
    auditor_cert    TEXT,
    draw_date       DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_date  DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages — group community chat
CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    channel         TEXT NOT NULL DEFAULT 'general',
    content         TEXT NOT NULL,
    message_type    TEXT DEFAULT 'text' CHECK(message_type IN ('text','image','link','location','system','announcement')),
    metadata        TEXT,  -- JSON: image_url, link_url, lat, lng, location_name
    reply_to        TEXT REFERENCES messages(id),
    edited          INTEGER DEFAULT 0,
    deleted         INTEGER DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drives / Events — group drives, track days, rallies
CREATE TABLE IF NOT EXISTS drives (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    drive_type      TEXT NOT NULL DEFAULT 'rally' CHECK(drive_type IN ('rally','breakfast','track','meet','tour')),
    date            DATE NOT NULL,
    start_time      TIME,
    start_location  TEXT,
    end_location    TEXT,
    distance        TEXT,
    max_cars        INTEGER DEFAULT 50,
    tier_required   TEXT,  -- NULL means open to all tiers
    status          TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming','active','completed','cancelled')),
    route_data      TEXT,  -- JSON for GPS route
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drive registrations — who signed up for which drive
CREATE TABLE IF NOT EXISTS drive_registrations (
    id              TEXT PRIMARY KEY,
    drive_id        TEXT NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    car_make        TEXT,
    car_model       TEXT,
    car_year        INTEGER,
    car_color       TEXT,
    status          TEXT DEFAULT 'registered' CHECK(status IN ('registered','confirmed','cancelled','attended')),
    checked_in      INTEGER DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(drive_id, member_id)
);

-- Live tracking data — GPS positions during drives
CREATE TABLE IF NOT EXISTS tracking_positions (
    id              TEXT PRIMARY KEY,
    drive_id        TEXT REFERENCES drives(id),
    group_id        TEXT REFERENCES drive_groups(id),
    member_id       TEXT NOT NULL REFERENCES members(id),
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL,
    speed           REAL,
    heading         REAL,
    altitude        REAL,
    accuracy        REAL,
    recorded_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Partner discounts
CREATE TABLE IF NOT EXISTS partners (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    category        TEXT,
    discount_desc   TEXT,
    discount_pct    REAL,
    tier_required   TEXT,
    logo_url        TEXT,
    website_url     TEXT,
    active          INTEGER DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id              TEXT PRIMARY KEY,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT,
    type            TEXT DEFAULT 'info' CHECK(type IN ('info','success','warning','draw','event','payment')),
    read            INTEGER DEFAULT 0,
    action_url      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prize configuration — admin sets prizes per tier
CREATE TABLE IF NOT EXISTS prize_config (
    id              TEXT PRIMARY KEY,
    tier            TEXT NOT NULL UNIQUE CHECK(tier IN ('free','ignite','apex','dynasty')),
    prize_name      TEXT NOT NULL,
    prize_desc      TEXT,
    prize_value     REAL DEFAULT 0,
    prize_image_url TEXT,
    upcoming_name   TEXT,
    upcoming_desc   TEXT,
    upcoming_value  REAL DEFAULT 0,
    upcoming_image_url TEXT,
    draw_date_hint  TEXT,
    updated_by      TEXT REFERENCES members(id),
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drive groups — members create groups and invite others
CREATE TABLE IF NOT EXISTS drive_groups (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    emoji           TEXT DEFAULT '🏎️',
    drive_id        TEXT REFERENCES drives(id),
    creator_id      TEXT NOT NULL REFERENCES members(id),
    invite_code     TEXT UNIQUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drive_group_members (
    id              TEXT PRIMARY KEY,
    group_id        TEXT NOT NULL REFERENCES drive_groups(id) ON DELETE CASCADE,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    share_location  INTEGER DEFAULT 1,
    joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, member_id)
);

-- Audit log — every significant action
CREATE TABLE IF NOT EXISTS audit_log (
    id              TEXT PRIMARY KEY,
    actor_id        TEXT,
    actor_type      TEXT DEFAULT 'member' CHECK(actor_type IN ('member','admin','system','payfast')),
    action          TEXT NOT NULL,
    resource_type   TEXT,
    resource_id     TEXT,
    details         TEXT,  -- JSON
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Promoters — Instagram influencer / affiliate referral codes
CREATE TABLE IF NOT EXISTS promoters (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    instagram       TEXT,
    email           TEXT,
    phone           TEXT,
    code            TEXT NOT NULL UNIQUE COLLATE NOCASE,
    discount_pct    REAL NOT NULL DEFAULT 10,
    commission_pct  REAL NOT NULL DEFAULT 5,
    status          TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','inactive')),
    total_referrals INTEGER DEFAULT 0,
    total_revenue   REAL DEFAULT 0,
    total_commission REAL DEFAULT 0,
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Referrals — links members to the promoter who referred them
CREATE TABLE IF NOT EXISTS referrals (
    id              TEXT PRIMARY KEY,
    member_id       TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    promoter_id     TEXT NOT NULL REFERENCES promoters(id),
    code_used       TEXT NOT NULL,
    discount_pct    REAL NOT NULL,
    tier_at_signup  TEXT,
    converted       INTEGER DEFAULT 0,
    converted_at    DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══ Indexes for performance ═══
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_sub ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_member ON draw_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draws_tier ON draws(tier);
CREATE INDEX IF NOT EXISTS idx_draws_winner ON draws(winner_id);
CREATE INDEX IF NOT EXISTS idx_messages_member ON messages(member_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_drive_regs_drive ON drive_registrations(drive_id);
CREATE INDEX IF NOT EXISTS idx_drive_regs_member ON drive_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_tracking_drive ON tracking_positions(drive_id);
CREATE INDEX IF NOT EXISTS idx_tracking_group ON tracking_positions(group_id);
CREATE INDEX IF NOT EXISTS idx_tracking_member ON tracking_positions(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_promoters_code ON promoters(code);
CREATE INDEX IF NOT EXISTS idx_referrals_member ON referrals(member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_promoter ON referrals(promoter_id);
