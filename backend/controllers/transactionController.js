/**
 * Transaction Controller
 * -----------------------
 * Handles all CRUD operations for transactions.
 *
 * DBMS Modules Demonstrated:
 *   Module II  : DML — INSERT, UPDATE, DELETE, SELECT
 *   Module III : Comparison Operators (>, <, =, >=, <=), Logical (AND, OR, NOT), LIKE
 *   Module IV  : IN, BETWEEN, ORDER BY, LIMIT, OFFSET
 *   Module VII : CASE clause
 *   Module IX  : JOIN (INNER JOIN)
 */

const db = require('../db/connection');

/**
 * GET all transactions with optional filters
 *
 * Query params:
 *   - search:      search in notes (uses LIKE — Module III)
 *   - startDate:   filter from date (uses BETWEEN — Module IV)
 *   - endDate:     filter to date (uses BETWEEN — Module IV)
 *   - category:    filter by single category_id
 *   - categories:  filter by multiple category IDs (uses IN — Module IV)
 *   - type:        filter by income/expense
 *   - user_id:     filter by a specific user
 *   - page:        page number for pagination (default: 1)
 *   - limit:       items per page (default: 10)
 */
const getAllTransactions = (req, res) => {
    try {
        const {
            search,
            startDate,
            endDate,
            category,
            categories,
            type,
            user_id,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const params = [];
        const conditions = [];

        // --- MODULE III — LIKE: Pattern matching to search notes ---
        if (search) {
            conditions.push(`t.note LIKE ?`);
            params.push(`%${search}%`);
        }

        // --- MODULE IV — BETWEEN: Filter by date range ---
        if (startDate && endDate) {
            conditions.push(`t.date BETWEEN ? AND ?`);
            params.push(startDate, endDate);
        } else if (startDate) {
            // MODULE III — Comparison operator: >=
            conditions.push(`t.date >= ?`);
            params.push(startDate);
        } else if (endDate) {
            // MODULE III — Comparison operator: <=
            conditions.push(`t.date <= ?`);
            params.push(endDate);
        }

        // --- MODULE IV — IN: Filter by multiple categories ---
        if (categories) {
            const catArray = categories.split(',').map(c => parseInt(c));
            const placeholders = catArray.map(() => '?').join(', ');
            conditions.push(`t.category_id IN (${placeholders})`);
            params.push(...catArray);
        } else if (category) {
            // MODULE III — Comparison operator: =
            conditions.push(`t.category_id = ?`);
            params.push(parseInt(category));
        }

        // MODULE III — Comparison operator: = (type filter)
        if (type) {
            conditions.push(`t.type = ?`);
            params.push(type);
        }

        if (user_id) {
            conditions.push(`t.user_id = ?`);
            params.push(parseInt(user_id));
        }

        // MODULE III — Logical operator: AND (combining multiple conditions)
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        /**
         * Main query demonstrating:
         *   - MODULE IX  — JOIN: combine transactions with users and categories
         *   - MODULE VII — CASE: classify spending level
         *   - MODULE IV  — ORDER BY + LIMIT + OFFSET: sorting and pagination
         *   - MODULE VI  — strftime: date formatting
         */
        const query = `
            SELECT
                t.transaction_id,
                t.user_id,
                u.name AS user_name,
                t.category_id,
                c.category_name,
                t.amount,
                t.type,
                t.note,
                t.date,

                -- MODULE VII — CASE: Classify transaction amount
                CASE
                    WHEN t.amount > 5000 THEN 'High'
                    WHEN t.amount BETWEEN 1000 AND 5000 THEN 'Medium'
                    ELSE 'Low'
                END AS spending_level,

                -- MODULE VI — strftime: format date
                strftime('%d/%m/%Y', t.date) AS formatted_date

            FROM transactions t

            -- MODULE IX — JOIN: get user name and category name
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id

            ${whereClause}

            -- MODULE IV — ORDER BY: sort by date descending
            ORDER BY t.date DESC

            -- MODULE IV — LIMIT + OFFSET: pagination
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);

        const transactions = db.prepare(query).all(...params);

        // Count total for pagination metadata
        const countParams = params.slice(0, -2); // remove limit/offset
        const countQuery = `
            SELECT COUNT(*) as total
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            ${whereClause}
        `;
        const { total } = db.prepare(countQuery).get(...countParams);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
};

/**
 * POST a new transaction
 * MODULE II — DML: INSERT
 * Uses parameterized queries to prevent SQL injection
 */
const addTransaction = (req, res) => {
    try {
        const { user_id, category_id, amount, type, note, date } = req.body;

        // Validate required fields
        if (!user_id || !category_id || !amount || !type || !date) {
            return res.status(400).json({ error: 'Missing required fields: user_id, category_id, amount, type, date' });
        }

        // MODULE III — Logical: validate type is in allowed values
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Type must be "income" or "expense"' });
        }

        // MODULE II — DML: Parameterized INSERT
        const stmt = db.prepare(`
            INSERT INTO transactions (user_id, category_id, amount, type, note, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(user_id, category_id, amount, type, note || '', date);

        res.status(201).json({
            message: 'Transaction added successfully',
            transaction_id: result.lastInsertRowid
        });
    } catch (err) {
        console.error('Error adding transaction:', err.message);
        res.status(500).json({ error: 'Failed to add transaction', details: err.message });
    }
};

/**
 * PUT — Update an existing transaction
 * MODULE II — DML: UPDATE
 */
const updateTransaction = (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, category_id, amount, type, note, date } = req.body;

        // MODULE II — DML: SELECT to check existence
        const existing = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // MODULE II — DML: UPDATE with parameterized query
        const stmt = db.prepare(`
            UPDATE transactions
            SET user_id = ?, category_id = ?, amount = ?, type = ?, note = ?, date = ?
            WHERE transaction_id = ?
        `);

        stmt.run(
            user_id || existing.user_id,
            category_id || existing.category_id,
            amount || existing.amount,
            type || existing.type,
            note !== undefined ? note : existing.note,
            date || existing.date,
            id
        );

        res.json({ message: 'Transaction updated successfully' });
    } catch (err) {
        console.error('Error updating transaction:', err.message);
        res.status(500).json({ error: 'Failed to update transaction', details: err.message });
    }
};

/**
 * DELETE a transaction by ID
 * MODULE II — DML: DELETE
 */
const deleteTransaction = (req, res) => {
    try {
        const { id } = req.params;

        const existing = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // MODULE II — DML: DELETE with parameterized query
        db.prepare('DELETE FROM transactions WHERE transaction_id = ?').run(id);

        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
    }
};

module.exports = {
    getAllTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
};
