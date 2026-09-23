const express = require('express');
const logger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const notFound = require('./middleware/notFound.middleware');
const { protect } = require('./middleware/auth.middleware');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const walletsRoutes = require('./routes/wallets.routes');
const expensesRoutes = require('./routes/expenses.routes');
const budgetsRoutes = require('./routes/budgets.routes');
const reportsRoutes = require('./routes/reports.routes');

const path = require('path');
const app = express();

app.use(express.json());
app.use(logger);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, usersRoutes);
app.use('/api/wallets', protect, walletsRoutes);
app.use('/api/expenses', protect, expensesRoutes);
app.use('/api/budgets', protect, budgetsRoutes);
app.use('/api/reports', protect, reportsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
