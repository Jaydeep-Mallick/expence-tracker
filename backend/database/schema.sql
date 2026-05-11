-- ============================================
-- Smart Expense Tracker — Database Schema
-- ============================================
-- DBMS Modules Covered in this file:
--   Module I  : Keys (PRIMARY KEY, FOREIGN KEY, UNIQUE)
--   Module II : DDL — CREATE TABLE, ALTER TABLE
--   Module IV : IN (CHECK constraint)
--   Module V  : GROUP BY (in VIEW)
--   Module VI : strftime, CASE expression (in VIEW)
--   Module X  : VIEW, INDEX
-- ============================================

-- Enable foreign key support (required for SQLite)
PRAGMA foreign_keys = ON;

-- ============================================
-- MODULE II — DDL: CREATE TABLE
-- ============================================

-- TABLE: users
-- PRIMARY KEY: user_id (Module I — Keys)
-- UNIQUE constraint on email (Module I — Keys)
CREATE TABLE IF NOT EXISTS users (
    user_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE
);

-- TABLE: categories
-- PRIMARY KEY: category_id
CREATE TABLE IF NOT EXISTS categories (
    category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT    NOT NULL UNIQUE
);

-- TABLE: transactions
-- PRIMARY KEY: transaction_id
-- FOREIGN KEYS: user_id → users, category_id → categories (Module I — Keys)
-- CHECK + IN: type must be IN ('income', 'expense') (Module IV — IN operator)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL,
    category_id    INTEGER NOT NULL,
    amount         REAL    NOT NULL CHECK (amount > 0),
    type           TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
    note           TEXT,
    date           TEXT    NOT NULL,  -- stored as 'YYYY-MM-DD'

    FOREIGN KEY (user_id)     REFERENCES users(user_id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- ============================================
-- MODULE II — DDL: ALTER TABLE
-- Adding a 'created_at' column to track when rows were inserted
-- ============================================
ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'));
ALTER TABLE transactions ADD COLUMN created_at TEXT DEFAULT (datetime('now'));

-- ============================================
-- MODULE X — INDEX
-- Improve query performance on frequently filtered columns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON transactions(date);

CREATE INDEX IF NOT EXISTS idx_transactions_category
    ON transactions(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type
    ON transactions(type);

-- ============================================
-- MODULE X — VIEW: monthly_summary
-- Uses: GROUP BY (Module V), CASE (Module VII),
--       strftime (Module VI), SUM aggregation (Module V)
-- ============================================
CREATE VIEW IF NOT EXISTS monthly_summary AS
SELECT
    strftime('%Y-%m', date) AS month,

    -- SUM + CASE: Total income for the month (Module V + VII)
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,

    -- SUM + CASE: Total expenses for the month
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,

    -- Arithmetic expression: Net balance = income - expense (Module VI)
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance,

    -- COUNT aggregation (Module V)
    COUNT(*) AS transaction_count,

    -- AVG aggregation (Module V)
    ROUND(AVG(amount), 2) AS avg_transaction

FROM transactions
GROUP BY strftime('%Y-%m', date)    -- GROUP BY month (Module V)
ORDER BY month DESC;

-- ============================================
-- VIEW: user_spending_summary
-- Demonstrates: JOIN (Module IX) + GROUP BY (Module V)
--               + HAVING (Module V) inside a view
-- ============================================
CREATE VIEW IF NOT EXISTS user_spending_summary AS
SELECT
    u.user_id,
    u.name,
    COUNT(t.transaction_id) AS total_transactions,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_spent,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_earned
FROM users u
LEFT JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, u.name;

-- ============================================
-- VIEW: user_monthly_summary
-- Groups by both user_id and month so we can filter stats globally
-- ============================================
CREATE VIEW IF NOT EXISTS user_monthly_summary AS
SELECT
    user_id,
    strftime('%Y-%m', date) AS month,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance,
    COUNT(*) AS transaction_count,
    ROUND(AVG(amount), 2) AS avg_transaction
FROM transactions
GROUP BY user_id, strftime('%Y-%m', date)
ORDER BY month DESC;
