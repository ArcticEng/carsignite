require('dotenv').config();
const fs = require('fs');
const path = require('path');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'carsignite.db');
if (fs.existsSync(DB_PATH)) { fs.unlinkSync(DB_PATH); console.log('✓ Database deleted'); }
console.log('✓ Run `npm run db:seed` to recreate');
