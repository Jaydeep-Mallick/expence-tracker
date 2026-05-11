/**
 * Summary Routes
 * ---------------
 * Routes for analytics, reports, and lookup data.
 */

const express = require('express');
const router = express.Router();
const {
    getMonthlySummary,
    getCategorySummary,
    getTopCategory,
    getOverview,
    getRecentTransactions,
    getHighSpendingMonths,
    getIncomeVsExpense,
    getUserSpending,
    getUsers,
    getCategories
} = require('../controllers/summaryController');

// GET /api/summary/monthly        → Monthly grouped income/expense (VIEW — Module X)
router.get('/monthly', getMonthlySummary);

// GET /api/summary/category       → Category-wise spending (LEFT JOIN + HAVING — Module V, IX)
router.get('/category', getCategorySummary);

// GET /api/summary/top            → Highest spending category (Subquery — Module X)
router.get('/top', getTopCategory);

// GET /api/summary/overview       → Total income, expense, balance (CASE + Aggregation — Module V, VII)
router.get('/overview', getOverview);

// GET /api/summary/recent         → Last 5 transactions (ORDER BY + LIMIT — Module IV)
router.get('/recent', getRecentTransactions);

// GET /api/summary/high-spending  → Months with high spending (GROUP BY + HAVING — Module V)
router.get('/high-spending', getHighSpendingMonths);

// GET /api/summary/income-vs-expense → Income vs Expense comparison (UNION — Module VII)
router.get('/income-vs-expense', getIncomeVsExpense);

// GET /api/summary/user-spending  → Per-user analysis (VIEW + Subquery — Module X)
router.get('/user-spending', getUserSpending);

// GET /api/summary/users          → All users (for forms)
router.get('/users', getUsers);

// GET /api/summary/categories     → All categories (for forms)
router.get('/categories', getCategories);

module.exports = router;
