const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgets.controller');

router.get('/', budgetsController.getBudgets);
router.post('/', budgetsController.createBudget);
router.patch('/:id', budgetsController.updateBudget);
router.delete('/:id', budgetsController.deleteBudget);

module.exports = router;
