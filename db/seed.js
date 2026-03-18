// ═══════════════════════════════════════════
// CarsIgnite — DB Init & Seed
// ═══════════════════════════════════════════
require('dotenv').config();
const { getDb, Members, Subscriptions, Drives, Messages, Audit, PrizeConfig, TIERS } = require('./database');

// Initialize tables
console.log('✓ Database initialized');

// Seed default drives
const drives = [
  { name: 'Joburg → Durban Coastal Run', driveType: 'rally', date: '2026-03-22', distance: '580km', maxCars: 50,
    description: 'Epic 580km supercar convoy from Johannesburg to Durban via the N3. Breakfast stop in Harrismith.' },
  { name: 'Cape Winelands Breakfast Run', driveType: 'breakfast', date: '2026-03-29', distance: '120km', maxCars: 40,
    description: 'Sunrise drive through Stellenbosch and Franschhoek wine estates. Breakfast at La Petite Ferme.' },
  { name: 'Garden Route Explorer', driveType: 'rally', date: '2026-04-12', distance: '340km', maxCars: 30,
    description: 'George to Storms River via Knysna. Dramatic coastal scenery with mountain passes.' },
  { name: 'Kyalami Track Day', driveType: 'track', date: '2026-04-19', distance: 'Track', maxCars: 45,
    description: 'Exclusive track day at Kyalami Grand Prix Circuit. Professional marshals and timing.' },
  { name: 'Franschhoek Supercar Meet', driveType: 'meet', date: '2026-05-03', distance: '45km', maxCars: 60,
    description: 'Monthly supercar meet at the Franschhoek Motor Museum. Display, socialize, drive.' },
  { name: 'Chapman\'s Peak Sunset Cruise', driveType: 'rally', date: '2026-05-17', distance: '65km', maxCars: 35,
    description: 'Iconic Chapman\'s Peak Drive at sunset. One of the most scenic roads in the world.' },
];

const existing = Drives.getAll();
if (existing.length === 0) {
  drives.forEach(d => Drives.create(d));
  console.log(`✓ Seeded ${drives.length} drives`);
} else {
  console.log(`✓ ${existing.length} drives already exist`);
}

// Seed prize config defaults
PrizeConfig.initDefaults();
console.log('✓ Prize config initialized');

// Seed default admin if configured and not existing
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail && !Members.getByEmail(adminEmail)) {
  const bcrypt = require('bcrypt');
  const pw = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(pw, 10);
  Members.create({
    firstName: 'Admin', lastName: 'CarsIgnite', email: adminEmail,
    phone: '+27000000000', passwordHash: hash, tier: 'dynasty', role: 'admin',
    city: 'Cape Town', province: 'western_cape', status: 'active'
  });
  // Admin doesn't pay — no subscription created
  console.log(`✓ Admin user created: ${adminEmail} / ${pw}`);
} else if (adminEmail) {
  console.log(`✓ Admin user exists: ${adminEmail}`);
}

console.log('✓ Seed complete');

// Only exit if run directly (not when imported by server)
if (require.main === module) {
  process.exit(0);
}
