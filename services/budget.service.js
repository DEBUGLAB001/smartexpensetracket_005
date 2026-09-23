const datastore = require('../models/datastore');
const expenseService = require('./expense.service');

const createBudget = async (userId, category, monthlyLimit, month, year) => {
  return await datastore.insert('budgets', {
    userId,
    category,
    monthlyLimit: Number(monthlyLimit),
    month: Number(month),
    year: Number(year)
  });
};

const getBudgets = async (userId) => {
  return await datastore.find('budgets', { userId });
};

const getBudgetWithStatus = async (userId, budgetId) => {
  const budget = await datastore.findById('budgets', budgetId);
  if (!budget || budget.userId !== userId) return null;
  
  const expenses = await expenseService.getExpenses(userId);
  const spentAmount = expenses
    .filter(e => 
      e.category === budget.category && 
      e.type === 'expense' &&
      new Date(e.date).getMonth() + 1 === budget.month &&
      new Date(e.date).getFullYear() === budget.year
    )
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const remaining = budget.monthlyLimit + spentAmount; 
  
  return {
    ...budget,
    spentAmount,
    remaining,
    exceeded: spentAmount > budget.monthlyLimit
  };
};

const updateBudget = async (id, userId, updates) => {
  const budget = await datastore.findById('budgets', id);
  if (!budget || budget.userId !== userId) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }
  return await datastore.update('budgets', id, updates);
};

const deleteBudget = async (id, userId) => {
  const budget = await datastore.findById('budgets', id);
  if (!budget || budget.userId !== userId) return false;
  return await datastore.remove('budgets', id);
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetWithStatus,
  updateBudget,
  deleteBudget
};
