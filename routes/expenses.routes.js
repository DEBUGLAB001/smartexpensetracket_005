const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expenses.controller');

router.get('/search', expensesController.searchExpenses);
router.get('/filter', expensesController.filterExpenses);
router.get('/', expensesController.getExpenses);
router.post('/', expensesController.createExpense);
router.get('/:id', expensesController.getExpenseById);
router.patch('/:id', expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

module.exports = router;
