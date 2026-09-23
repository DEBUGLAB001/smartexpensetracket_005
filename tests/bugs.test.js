const request = require('supertest');
const app = require('../app');
const datastore = require('../models/datastore');

describe('Intentional Bugs Test Suite', () => {
  let user1Token, user2Token, user1Id, user2Id, wallet1Id, expenseId, budgetId;

  beforeAll(async () => {
    // Reset DB
    await datastore.writeDB({
      users: [],
      wallets: [],
      expenses: [],
      categories: ["Food", "Travel", "Education", "Shopping", "Health", "Entertainment"],
      budgets: []
    });

    // Create User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123'
    });
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Create User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password123'
    });
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  it('Bug 1: DELETE returns 204 status code', async () => {
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Test Wallet', balance: 100
    });
    wallet1Id = wRes.body.data.id;

    const eRes = await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wallet1Id, title: 'Lunch', amount: 10, category: 'Food', type: 'expense'
    });
    expenseId = eRes.body.data.id;

    const delRes = await request(app).delete(`/api/expenses/${expenseId}`).set('Authorization', `Bearer ${user1Token}`);
    expect(delRes.status).toBe(204);
  });

  it('Bug 2: Budget remaining calculation', async () => {
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Budget Wallet', balance: 1000
    });
    const wId = wRes.body.data.id;

    const bRes = await request(app).post('/api/budgets').set('Authorization', `Bearer ${user1Token}`).send({
      category: 'Food', monthlyLimit: 500, month: 10, year: 2026
    });
    budgetId = bRes.body.data.id;

    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Dinner', amount: 100, category: 'Food', type: 'expense', date: '2026-10-15T12:00:00Z'
    });

    const listRes = await request(app).get('/api/budgets').set('Authorization', `Bearer ${user1Token}`);
    const foodBudget = listRes.body.data.find(b => b.id === budgetId);

    expect(foodBudget.remaining).toBe(400);
  });

  it('Bug 3: Wallet authorization', async () => {
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Private Wallet', balance: 500
    });
    const wId = wRes.body.data.id;

    const upRes = await request(app).patch(`/api/wallets/${wId}`).set('Authorization', `Bearer ${user2Token}`).send({
      walletName: 'Hacked Wallet'
    });

    expect(upRes.status).toBe(403);
  });

  it('Bug 4: Expense filter ignores completed month', async () => {
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Filter Wallet', balance: 1000
    });
    const wId = wRes.body.data.id;

    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Oct Expense', amount: 50, category: 'Travel', type: 'expense', date: '2026-10-15T12:00:00Z'
    });

    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Nov Expense', amount: 50, category: 'Travel', type: 'expense', date: '2026-11-15T12:00:00Z'
    });

    const fRes = await request(app).get('/api/expenses/filter?month=11').set('Authorization', `Bearer ${user1Token}`);
    expect(fRes.body.data.length).toBe(1);
    expect(fRes.body.data[0].title).toBe('Nov Expense');
  });

  it('Bug 5: Duplicate email validation edge case', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'User Duplicate',
      email: 'USER1@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(409);
  });

  afterAll(async () => {
    // Clean up test data and restore clean seed state
    await datastore.writeDB({
      users: [
        {
          id: "710020e0576b51ac85fd97dc32cc7655",
          name: "Test User",
          email: "test@example.com",
          passwordHash: "$2b$10$E/06EdYxllH5BRTZJHUYiuT6TKN2nDQKRt8R.tQwcohlmTtrMFbFK",
          createdAt: new Date().toISOString()
        }
      ],
      wallets: [],
      expenses: [],
      categories: ["Food", "Travel", "Education", "Shopping", "Health", "Entertainment"],
      budgets: []
    });
  });
});
