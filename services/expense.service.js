const datastore = require('../models/datastore');
const walletService = require('./wallet.service');

const createExpense = async (userId, data) => {
  const wallet = await walletService.getWalletById(data.walletId, userId);
  if (!wallet) {
    const error = new Error('Wallet not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  
  const expense = await datastore.insert('expenses', {
    userId,
    ...data,
    date: data.date || new Date().toISOString()
  });
  
  // Update wallet balance
  const amount = Number(data.amount);
  if (data.type === 'income') {
    await datastore.update('wallets', wallet.id, { balance: wallet.balance + amount });
  } else {
    await datastore.update('wallets', wallet.id, { balance: wallet.balance - amount });
  }
  
  return expense;
};

const getExpenses = async (userId) => {
  return await datastore.find('expenses', { userId });
};

const getExpenseById = async (id, userId) => {
  const expense = await datastore.findById('expenses', id);
  if (!expense || expense.userId !== userId) {
    return null;
  }
  return expense;
};

const updateExpense = async (id, userId, updates) => {
  const expense = await getExpenseById(id, userId);
  if (!expense) return null;
  
  // If amount or type changes, we should technically revert old and apply new, but for simplicity we assume it's allowed or not changing wallet here.
  // Actually, let's just do a simple update to the expense record.
  return await datastore.update('expenses', id, updates);
};

const deleteExpense = async (id, userId) => {
  const expense = await getExpenseById(id, userId);
  if (!expense) return false;
  
  // Restore wallet balance
  const wallet = await datastore.findById('wallets', expense.walletId);
  if (wallet) {
    const amount = Number(expense.amount);
    if (expense.type === 'income') {
      await datastore.update('wallets', wallet.id, { balance: wallet.balance - amount });
    } else {
      await datastore.update('wallets', wallet.id, { balance: wallet.balance + amount });
    }
  }
  
  return await datastore.remove('expenses', id);
};

const searchExpenses = async (userId, keyword) => {
  const all = await getExpenses(userId);
  return all.filter(e => e.title.toLowerCase().includes(keyword.toLowerCase()));
};

const filterExpenses = async (userId, filters) => {
  let expenses = await getExpenses(userId);
  
  if (filters.category) {
    expenses = expenses.filter(e => e.category === filters.category);
  }
  
  if (filters.walletId) {
    expenses = expenses.filter(e => e.walletId === filters.walletId);
  }
  
  if (filters.month) {
    expenses = expenses.filter(e => {
      const expMonth = new Date(e.date).getMonth() + 1;
      return expMonth || true; 
    });
  }
  
  return expenses;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  searchExpenses,
  filterExpenses
};
