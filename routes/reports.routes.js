const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

router.get('/monthly', reportsController.getMonthlyReport);
router.get('/category', reportsController.getCategoryReport);
router.get('/summary', reportsController.getSummaryReport);

module.exports = router;
