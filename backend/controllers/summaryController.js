/**
 * Summary Controller
 * -------------------
 * Handles analytics and reporting endpoints.
 */

const db = require('../db/connection');

const getMonthlySummary = (req, res) => {
    try {
        const { user_id } = req.query;
        let summary;
        if (user_id) {
            summary = db.prepare(`
                SELECT * FROM user_monthly_summary
                WHERE user_id = ?
                ORDER BY month DESC
            `).all(user_id);
        } else {
            summary = db.prepare(`
                SELECT * FROM monthly_summary
                ORDER BY month DESC
            `).all();
        }
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch monthly summary', details: err.message });
    }
};

const getCategorySummary = (req, res) => {
    try {
        const { user_id } = req.query;
        const joinCondition = user_id ? `ON c.category_id = t.category_id AND t.user_id = ?` : `ON c.category_id = t.category_id`;
        const params = user_id ? [user_id] : [];

        const summary = db.prepare(`
            SELECT
                c.category_id,
                c.category_name,
                SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense,
                SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
                COUNT(t.transaction_id) AS transaction_count,
                ROUND(AVG(t.amount), 2) AS avg_amount,
                CAST(COUNT(t.transaction_id) AS TEXT) || ' txns' AS count_label
            FROM categories c
            LEFT JOIN transactions t ${joinCondition}
            GROUP BY c.category_id, c.category_name
            HAVING COUNT(t.transaction_id) > 0
            ORDER BY total_expense DESC
        `).all(...params);

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch category summary', details: err.message });
    }
};

const getTopCategory = (req, res) => {
    try {
        const { user_id } = req.query;
        const whereClause = user_id ? `WHERE type = 'expense' AND user_id = ?` : `WHERE type = 'expense'`;
        const params = user_id ? [user_id] : [];

        const top = db.prepare(`
            SELECT
                c.category_name,
                sub.total_spent
            FROM (
                SELECT
                    category_id,
                    SUM(amount) AS total_spent
                FROM transactions
                ${whereClause}
                GROUP BY category_id
                ORDER BY total_spent DESC
                LIMIT 1
            ) sub
            JOIN categories c ON sub.category_id = c.category_id
        `).get(...params);

        res.json(top || { category_name: 'N/A', total_spent: 0 });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch top category', details: err.message });
    }
};

const getOverview = (req, res) => {
    try {
        const { user_id } = req.query;
        const whereClause = user_id ? `WHERE user_id = ?` : ``;
        const params = user_id ? [user_id] : [];

        const overview = db.prepare(`
            SELECT
                SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)
                - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance,
                COUNT(*) AS total_transactions
            FROM transactions
            ${whereClause}
        `).get(...params);

        res.json(overview || { total_income: 0, total_expense: 0, balance: 0, total_transactions: 0 });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch overview', details: err.message });
    }
};

const getRecentTransactions = (req, res) => {
    try {
        const { user_id } = req.query;
        const whereClause = user_id ? `WHERE t.user_id = ?` : ``;
        const params = user_id ? [user_id] : [];

        const recent = db.prepare(`
            SELECT
                t.transaction_id,
                u.name AS user_name,
                c.category_name,
                t.amount,
                t.type,
                t.note,
                t.date,
                CASE
                    WHEN t.amount > 5000 THEN 'High'
                    WHEN t.amount BETWEEN 1000 AND 5000 THEN 'Medium'
                    ELSE 'Low'
                END AS spending_level,
                strftime('%d %b %Y', t.date) AS formatted_date
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            JOIN categories c ON t.category_id = c.category_id
            ${whereClause}
            ORDER BY t.date DESC, t.transaction_id DESC
            LIMIT 5
        `).all(...params);

        res.json(recent);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recent transactions', details: err.message });
    }
};

const getHighSpendingMonths = (req, res) => {
    try {
        const { user_id } = req.query;
        const threshold = req.query.threshold || 5000;
        const whereClause = user_id ? `WHERE type = 'expense' AND user_id = ?` : `WHERE type = 'expense'`;
        const params = user_id ? [user_id, parseInt(threshold)] : [parseInt(threshold)];

        const months = db.prepare(`
            SELECT
                strftime('%Y-%m', date) AS month,
                SUM(amount) AS total_expense,
                COUNT(*) AS num_transactions,
                ROUND(AVG(amount), 2) AS avg_per_transaction
            FROM transactions
            ${whereClause}
            GROUP BY strftime('%Y-%m', date)
            HAVING SUM(amount) > ?
            ORDER BY total_expense DESC
        `).all(...params);

        res.json(months);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch high spending months', details: err.message });
    }
};

const getIncomeVsExpense = (req, res) => {
    try {
        const { user_id } = req.query;
        const whereClauseIncome = user_id ? `WHERE type = 'income' AND user_id = ?` : `WHERE type = 'income'`;
        const whereClauseExpense = user_id ? `WHERE type = 'expense' AND user_id = ?` : `WHERE type = 'expense'`;
        const params = user_id ? [user_id, user_id] : [];

        const data = db.prepare(`
            SELECT
                'Income' AS summary_type,
                COUNT(*) AS count,
                SUM(amount) AS total,
                ROUND(AVG(amount), 2) AS average,
                MIN(amount) AS minimum,
                MAX(amount) AS maximum
            FROM transactions
            ${whereClauseIncome}
            UNION
            SELECT
                'Expense' AS summary_type,
                COUNT(*) AS count,
                SUM(amount) AS total,
                ROUND(AVG(amount), 2) AS average,
                MIN(amount) AS minimum,
                MAX(amount) AS maximum
            FROM transactions
            ${whereClauseExpense}
        `).all(...params);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch income vs expense', details: err.message });
    }
};

const getUserSpending = (req, res) => {
    try {
        const { user_id } = req.query;
        const whereClause = user_id ? `WHERE user_id = ?` : ``;
        const params = user_id ? [user_id] : [];

        const data = db.prepare(`
            SELECT
                *,
                CASE
                    WHEN total_spent > (SELECT AVG(total_spent) FROM user_spending_summary) THEN 'Above Average'
                    ELSE 'Below Average'
                END AS spending_status
            FROM user_spending_summary
            ${whereClause}
            ORDER BY total_spent DESC
        `).all(...params);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user spending', details: err.message });
    }
};

const getUsers = (req, res) => {
    try {
        const users = db.prepare('SELECT * FROM users ORDER BY name').all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
};

const getCategories = (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY category_name').all();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
    }
};

module.exports = {
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
};
