const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../data/db.json');

async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialData = {
        users: [
          {
            id: "710020e0576b51ac85fd97dc32cc7655",
            name: "Test User",
            email: "test@example.com",
            passwordHash: "$2b$10$E/06EdYxllH5BRTZJHUYiuT6TKN2nDQKRt8R.tQwcohlmTtrMFbFK",
            createdAt: "2026-09-23T10:29:07.031Z"
          }
        ],
        wallets: [],
        expenses: [],
        categories: ["Food", "Travel", "Education", "Shopping", "Health", "Entertainment"],
        budgets: []
      };
      await writeDB(initialData);
      return initialData;
    }
    throw error;
  }
}

async function writeDB(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function insert(collection, item) {
  const db = await readDB();
  if (!db[collection]) {
    db[collection] = [];
  }
  const newItem = { id: generateId(), createdAt: new Date().toISOString(), ...item };
  db[collection].push(newItem);
  await writeDB(db);
  return newItem;
}

async function update(collection, id, updates) {
  const db = await readDB();
  if (!db[collection]) return null;
  const index = db[collection].findIndex(item => item.id === id);
  if (index === -1) return null;
  
  db[collection][index] = { ...db[collection][index], ...updates };
  await writeDB(db);
  return db[collection][index];
}

async function remove(collection, id) {
  const db = await readDB();
  if (!db[collection]) return false;
  const index = db[collection].findIndex(item => item.id === id);
  if (index === -1) return false;
  
  db[collection].splice(index, 1);
  await writeDB(db);
  return true;
}

async function findById(collection, id) {
  const db = await readDB();
  if (!db[collection]) return null;
  return db[collection].find(item => item.id === id) || null;
}

async function find(collection, query = {}) {
  const db = await readDB();
  if (!db[collection]) return [];
  return db[collection].filter(item => {
    return Object.keys(query).every(key => item[key] === query[key]);
  });
}

module.exports = {
  readDB,
  writeDB,
  generateId,
  insert,
  update,
  remove,
  findById,
  find
};
