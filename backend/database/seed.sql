-- ============================================
-- Smart Expense Tracker — Sample Data
-- ============================================
-- 3 users, 6 categories, 15 transactions
-- covering multiple months for meaningful reports
-- ============================================

-- ----------------
-- Users
-- ----------------
INSERT INTO users (name, email) VALUES ('Jaydeep Mallick', 'jaydeep@example.com');
INSERT INTO users (name, email) VALUES ('Priya Sharma', 'priya@example.com');
INSERT INTO users (name, email) VALUES ('Arjun Patel', 'arjun@example.com');

-- ----------------
-- Categories
-- ----------------
INSERT INTO categories (category_name) VALUES ('Food');
INSERT INTO categories (category_name) VALUES ('Transport');
INSERT INTO categories (category_name) VALUES ('Entertainment');
INSERT INTO categories (category_name) VALUES ('Salary');
INSERT INTO categories (category_name) VALUES ('Shopping');
INSERT INTO categories (category_name) VALUES ('Utilities');

-- ----------------
-- Transactions (15 entries)
-- Mix of income and expense across multiple months
-- ----------------

-- January 2025
INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 4, 50000.00, 'income', 'Monthly salary credited', '2025-01-05');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 1, 3200.00, 'expense', 'Groceries and dining out', '2025-01-10');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 6, 2500.00, 'expense', 'Electricity and water bill', '2025-01-15');

-- February 2025
INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (2, 4, 45000.00, 'income', 'Freelance project payment', '2025-02-01');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (2, 5, 8500.00, 'expense', 'Online shopping for gadgets', '2025-02-10');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 2, 1500.00, 'expense', 'Uber rides for the week', '2025-02-14');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (2, 3, 2000.00, 'expense', 'Movie tickets and popcorn', '2025-02-20');

-- March 2025
INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (3, 4, 60000.00, 'income', 'Monthly salary credited', '2025-03-01');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (3, 1, 4500.00, 'expense', 'Restaurant dinner with family', '2025-03-08');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 5, 12000.00, 'expense', 'New headphones and accessories', '2025-03-12');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (3, 2, 800.00, 'expense', 'Metro card recharge', '2025-03-18');

-- April 2025
INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 4, 50000.00, 'income', 'Monthly salary credited', '2025-04-05');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (2, 1, 2800.00, 'expense', 'Weekly groceries shopping', '2025-04-10');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (3, 6, 3500.00, 'expense', 'Internet and phone bill', '2025-04-15');

INSERT INTO transactions (user_id, category_id, amount, type, note, date)
VALUES (1, 3, 6000.00, 'expense', 'Concert tickets booking', '2025-04-22');
