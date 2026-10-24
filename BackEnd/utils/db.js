// ===== START: DB HELPER MODULE =====
// Lightweight file-based JSON "database". Good enough for a demo store;
// swap this out for a real database (MongoDB/Postgres) in production.
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB };
// ===== END: DB HELPER MODULE =====
