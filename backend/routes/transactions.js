/**
 * Transaction Routes
 * -------------------
 * RESTful routes for transaction CRUD operations.
 */

const express = require('express');
const router = express.Router();
const {
    getAllTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transactionController');

// GET  /api/transactions       → List all (with filters & pagination)
router.get('/', getAllTransactions);

// POST /api/transactions       → Create new transaction
router.post('/', addTransaction);

// PUT  /api/transactions/:id   → Update transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id → Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
