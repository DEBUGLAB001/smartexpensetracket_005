const expenseService = require('./expense.service');

const generateMonthlyReport = async (userId, month, year) => {
  const expenses = await expenseService.getExpenses(userId);
  
  const monthlyData = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
  });
  
  const totalIncome = monthlyData
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const totalExpense = monthlyData
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  return {
    month: Number(month),
    year: Number(year),
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    transactions: monthlyData.length
  };
};

const generateCategoryReport = async (userId, month, year) => {
  const expenses = await expenseService.getExpenses(userId);
  
  const monthlyData = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year) && e.type === 'expense';
  });
  
  const categoryTotals = {};
  monthlyData.forEach(e => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += Number(e.amount);
  });
  
  let highestCategory = null;
  let highestAmount = 0;
  
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  }
  
  return {
    categoryTotals,
    highestCategory,
    highestAmount
  };
};

const generateSummaryReport = async (userId) => {
  const expenses = await expenseService.getExpenses(userId);
  
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  return {
    totalIncome,
    totalExpense,
    remainingBalance: totalIncome - totalExpense
  };
};

module.exports = {
  generateMonthlyReport,
  generateCategoryReport,
  generateSummaryReport
};
