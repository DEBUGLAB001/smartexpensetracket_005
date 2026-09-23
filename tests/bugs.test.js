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
    // Setup wallet & expense for User 1
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Test Wallet', balance: 100
    });
    wallet1Id = wRes.body.data.id;

    const eRes = await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wallet1Id, title: 'Lunch', amount: 10, category: 'Food', type: 'expense'
    });
    expenseId = eRes.body.data.id;

    const delRes = await request(app).delete(`/api/expenses/${expenseId}`).set('Authorization', `Bearer ${user1Token}`);
    
    // Bug 1 is that it returns 200 instead of 204
    expect(delRes.status).toBe(204);
  });

  it('Bug 2: Budget remaining calculation', async () => {
    // Need a wallet for User 1
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Budget Wallet', balance: 1000
    });
    const wId = wRes.body.data.id;

    // Create a budget of 500
    const bRes = await request(app).post('/api/budgets').set('Authorization', `Bearer ${user1Token}`).send({
      category: 'Food', monthlyLimit: 500, month: 10, year: 2026
    });
    budgetId = bRes.body.data.id;

    // Add an expense of 100
    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Dinner', amount: 100, category: 'Food', type: 'expense', date: '2026-10-15T12:00:00Z'
    });

    // Check budget status
    const listRes = await request(app).get('/api/budgets').set('Authorization', `Bearer ${user1Token}`);
    const foodBudget = listRes.body.data.find(b => b.id === budgetId);

    // Bug 2 is remaining is calculated as limit + spent (500 + 100 = 600) instead of limit - spent (400)
    expect(foodBudget.remaining).toBe(400);
  });

  it('Bug 3: Wallet authorization', async () => {
    // Create wallet for User 1
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Private Wallet', balance: 500
    });
    const wId = wRes.body.data.id;

    // User 2 tries to update User 1's wallet
    const upRes = await request(app).patch(`/api/wallets/${wId}`).set('Authorization', `Bearer ${user2Token}`).send({
      walletName: 'Hacked Wallet'
    });

    // Bug 3 allows this, returning 200. It should be 403 or 404.
    expect(upRes.status).toBe(403);
  });

  it('Bug 4: Expense filter ignores completed month', async () => {
    const wRes = await request(app).post('/api/wallets').set('Authorization', `Bearer ${user1Token}`).send({
      walletName: 'Filter Wallet', balance: 1000
    });
    const wId = wRes.body.data.id;

    // Expense in October
    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Oct Expense', amount: 50, category: 'Travel', type: 'expense', date: '2026-10-15T12:00:00Z'
    });

    // Expense in November
    await request(app).post('/api/expenses').set('Authorization', `Bearer ${user1Token}`).send({
      walletId: wId, title: 'Nov Expense', amount: 50, category: 'Travel', type: 'expense', date: '2026-11-15T12:00:00Z'
    });

    // Filter by November
    const fRes = await request(app).get('/api/expenses/filter?month=11').set('Authorization', `Bearer ${user1Token}`);
    
    // Bug 4 ignores the month and returns both
    expect(fRes.body.data.length).toBe(1);
    expect(fRes.body.data[0].title).toBe('Nov Expense');
  });

  it('Bug 5: Duplicate email validation edge case', async () => {
    // Try registering with the same email but different casing
    const res = await request(app).post('/api/auth/register').send({
      name: 'User Duplicate',
      email: 'USER1@example.com', // User 1 already registered with user1@example.com
      password: 'password123'
    });

    // Bug 5 allows this (case sensitive check), so it returns 201. Should be 409 Conflict.
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
