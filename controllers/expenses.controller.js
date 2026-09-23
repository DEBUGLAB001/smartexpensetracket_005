const expenseService = require('../services/expense.service');
const { sendSuccess, sendError } = require('../utils/response');

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.user.id);
    sendSuccess(res, 200, expenses, 'Expenses retrieved');
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { walletId, title, amount, category, type } = req.body;
    if (!walletId || !title || !amount || !category || !type) {
      return sendError(res, 422, 'Required fields missing');
    }
    const expense = await expenseService.createExpense(req.user.id, req.body);
    sendSuccess(res, 201, expense, 'Expense created');
  } catch (error) {
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id, req.user.id);
    if (!expense) return sendError(res, 404, 'Expense not found');
    sendSuccess(res, 200, expense, 'Expense retrieved');
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.user.id, req.body);
    if (!expense) return sendError(res, 404, 'Expense not found');
    sendSuccess(res, 200, expense, 'Expense updated');
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const success = await expenseService.deleteExpense(req.params.id, req.user.id);
    if (!success) return sendError(res, 404, 'Expense not found');
    
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

const searchExpenses = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return sendError(res, 400, 'Search keyword is required');
    const expenses = await expenseService.searchExpenses(req.user.id, q);
    sendSuccess(res, 200, expenses, 'Search results');
  } catch (error) {
    next(error);
  }
};

const filterExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.filterExpenses(req.user.id, req.query);
    sendSuccess(res, 200, expenses, 'Filtered results');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  searchExpenses,
  filterExpenses
};
