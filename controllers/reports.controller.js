const reportService = require('../services/report.service');
const { sendSuccess, sendError } = require('../utils/response');

const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return sendError(res, 400, 'Month and year are required');
    const report = await reportService.generateMonthlyReport(req.user.id, month, year);
    sendSuccess(res, 200, report, 'Monthly report generated');
  } catch (error) {
    next(error);
  }
};

const getCategoryReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return sendError(res, 400, 'Month and year are required');
    const report = await reportService.generateCategoryReport(req.user.id, month, year);
    sendSuccess(res, 200, report, 'Category report generated');
  } catch (error) {
    next(error);
  }
};

const getSummaryReport = async (req, res, next) => {
  try {
    const report = await reportService.generateSummaryReport(req.user.id);
    sendSuccess(res, 200, report, 'Summary report generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  getCategoryReport,
  getSummaryReport
};
