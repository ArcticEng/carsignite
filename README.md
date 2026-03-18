# 🏎️ CarsIgnite — South Africa's Premier Supercar Community

Full-stack web application with SQLite database, Express API, PayFast integration, and modern vanilla JS frontend.

## Architecture

```
carsignite/
├── db/
│   ├── schema.sql         # 13 tables: members, subscriptions, payments, draws, etc.
│   ├── database.js        # Full ORM layer with CRUD for all tables
│   ├── seed.js            # Seed initial drives/events
│   └── reset.js           # Reset database
├── src/
│   ├── server.js          # Express API — 40+ endpoints
│   └── payfast.js         # PayFast recurring subscription integration
├── public/
│   └── index.html         # Complete SPA frontend
├── .env.example           # Environment config template
├── package.json
└── README.md
```

## Database Schema (13 Tables)

| Table | Purpose |
|-------|---------|
| `members` | User profiles: name, email, phone, ID, city, province, tier, status |
| `subscriptions` | PayFast recurring billing: tokens, amounts, billing dates, status |
| `payments` | Individual transaction records with PayFast references |
| `draws` | Completed giveaway draws with winner data, audit refs, prize values |
| `draw_entries` | Accumulating entries per member per draw cycle |
| `messages` | Group chat messages with channels and replies |
| `drives` | Events: rallies, breakfast runs, track days |
| `drive_registrations` | Who signed up for which drive (with car details) |
| `tracking_positions` | GPS lat/lng data during live drives |
| `partners` | Partner discount network |
| `notifications` | In-app notifications for members |
| `audit_log` | Every system action logged with actor, resource, details |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Initialize database and seed drives
npm run db:seed

# 4. Start server
npm start
# → http://localhost:3000
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new member + create subscription
- `POST /api/auth/login` — Login with email/password
- `GET  /api/auth/me` — Get current member + subscription

### Members
- `GET    /api/members` — List all members (filterable by tier, status)
- `GET    /api/members/:id` — Get member by ID
- `PATCH  /api/members/:id` — Update member
- `DELETE /api/members/:id` — Delete member

### Subscriptions
- `GET  /api/subscriptions` — All subscriptions + MRR
- `GET  /api/subscriptions/my` — Current member's subscription
- `POST /api/subscriptions/:id/cancel` — Cancel subscription
- `POST /api/subscriptions/:id/change-tier` — Change tier

### Payments
- `GET /api/payments` — All payment records
- `GET /api/payments/my` — Current member's payments

### PayFast
- `POST /api/payfast/generate` — Generate PayFast payment form data
- `POST /api/payfast/notify` — ITN callback (called by PayFast servers)

### Draws / Giveaways
- `GET  /api/draws` — All draw results
- `GET  /api/draws/:id` — Single draw detail
- `POST /api/draws/execute` — Execute a new draw for a tier
- `GET  /api/draws/my/wins` — Current member's wins

### Chat
- `GET  /api/messages` — Get channel messages (paginated)
- `POST /api/messages` — Send a message
- `POST /api/messages/clear` — Clear channel (admin)

### Drives / Events
- `GET  /api/drives` — All drives with registration counts
- `GET  /api/drives/upcoming` — Upcoming drives only
- `POST /api/drives` — Create new drive (admin)
- `POST /api/drives/:id/register` — Register for a drive

### Live Tracking
- `POST /api/tracking/position` — Submit GPS position
- `GET  /api/tracking/:driveId/positions` — Latest positions for a drive

### Notifications
- `GET  /api/notifications` — Get notifications
- `POST /api/notifications/:id/read` — Mark as read

### Admin
- `GET  /api/admin/analytics` — Full dashboard analytics
- `GET  /api/admin/audit` — Audit trail
- `POST /api/admin/reset` — Reset database (dev only)

## Subscription Tiers

| Tier | Price | Draw Entries | Prize | Frequency |
|------|-------|-------------|-------|-----------|
| IGNITE | R49/mo | 1 | Luxury Watch | Monthly |
| APEX | R99/mo | 5 | Supercar | Monthly |
| DYNASTY | R899/mo | 15 | Luxury Home | Quarterly |

## PayFast Integration

The app integrates with PayFast for recurring ZAR payments:

1. **Registration** → generates PayFast form data with subscription parameters
2. **Payment** → redirects to PayFast hosted payment page
3. **ITN Callback** → `/api/payfast/notify` processes payment confirmations
4. **Tokenization** → card stored as token for automatic monthly billing
5. **Failure handling** → auto-suspend after 3 failed payment attempts

Switch from sandbox to production by updating `.env`:
```
PAYFAST_MERCHANT_ID=your-live-id
PAYFAST_MERCHANT_KEY=your-live-key
PAYFAST_URL=https://www.payfast.co.za/eng/process
```

## Legal Compliance (SA)

- Giveaways structured as **promotional competitions** under Section 36 of the Consumer Protection Act (No. 68 of 2008)
- Subscription provides **genuine services** (GPS tracking, chat, events) — giveaway entries are complimentary
- All draws include **audit references** and are certified by an independent auditor
- Member data handled per **POPIA** (Protection of Personal Information Act)
- Full competition rules available on request per CPA requirements

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a proper DB path: `DB_PATH=/var/data/carsignite.db`
3. Set real PayFast credentials
4. Add HTTPS via reverse proxy (nginx)
5. Set strong `JWT_SECRET`
6. Consider PostgreSQL migration for scale

## License

Proprietary — CarsIgnite (Pty) Ltd
