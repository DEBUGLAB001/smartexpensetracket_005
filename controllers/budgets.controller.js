const budgetService = require('../services/budget.service');
const { sendSuccess, sendError } = require('../utils/response');

const getBudgets = async (req, res, next) => {
  try {
    const budgets = await budgetService.getBudgets(req.user.id);
    
    // Enrich with status if needed, or just return them.
    // To satisfy "Budget remaining calculation", let's map over them and get status.
    const enrichedBudgets = await Promise.all(
      budgets.map(b => budgetService.getBudgetWithStatus(req.user.id, b.id))
    );
    
    sendSuccess(res, 200, enrichedBudgets, 'Budgets retrieved');
  } catch (error) {
    next(error);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    if (!category || !monthlyLimit || !month || !year) {
      return sendError(res, 422, 'Required fields missing');
    }
    const budget = await budgetService.createBudget(req.user.id, category, monthlyLimit, month, year);
    sendSuccess(res, 201, budget, 'Budget created');
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(req.params.id, req.user.id, req.body);
    sendSuccess(res, 200, budget, 'Budget updated');
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const success = await budgetService.deleteBudget(req.params.id, req.user.id);
    if (!success) return sendError(res, 404, 'Budget not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
