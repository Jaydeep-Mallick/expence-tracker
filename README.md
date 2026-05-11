# 💰 Smart Expense Tracker

A full-stack expense tracking application built for the DBMS Project. Demonstrates all 10 syllabus modules with a modern, premium UI.

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS 3     |
| Backend    | Node.js, Express                    |
| Database   | SQLite (via better-sqlite3)         |
| HTTP       | Axios                               |

## 📁 Project Structure

```
DBMS PROJECT FINAL/
├── backend/
│   ├── server.js                     # Express entry point
│   ├── package.json
│   ├── database/
│   │   ├── schema.sql                # DDL: Tables, ALTER, Views, Indexes
│   │   ├── seed.sql                  # Sample data (15 rows)
│   │   ├── init.js                   # DB initialization script
│   │   └── expense_tracker.db        # SQLite database file
│   ├── db/
│   │   └── connection.js             # Database connection
│   ├── routes/
│   │   ├── transactions.js           # CRUD routes
│   │   └── summary.js                # Analytics routes
│   └── controllers/
│       ├── transactionController.js  # Transaction CRUD + filters
│       └── summaryController.js      # Analytics + reports
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/axios.js
│       └── components/
│           ├── Dashboard.jsx
│           ├── AddTransactionForm.jsx
│           ├── TransactionList.jsx
│           ├── Filters.jsx
│           ├── RecentTransactions.jsx
│           └── TopCategory.jsx
└── README.md
```

## 🚀 How to Run

### Step 1: Backend Setup

```bash
cd backend
npm install
npm run init-db    # Creates and seeds the SQLite database
npm start          # Starts Express on http://localhost:5001
```

### Step 2: Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:3000
```

### Step 3: Open the App

Open **http://localhost:3000** in your browser.

---

## 📚 DBMS Syllabus Module Mapping

### Module I — Database Fundamentals
| Concept | Where Demonstrated |
|---------|-------------------|
| Keys (PRIMARY KEY) | `schema.sql` — user_id, category_id, transaction_id |
| Keys (FOREIGN KEY) | `schema.sql` — transactions references users & categories |
| Keys (UNIQUE) | `schema.sql` — email in users, category_name in categories |
| ER Model concepts | Three entities (users, categories, transactions) with relationships |
| Relational Database | SQLite relational tables with proper schema |

### Module II — SQL Basics & Table Operations
| Concept | Where Demonstrated |
|---------|-------------------|
| DDL: CREATE TABLE | `schema.sql` — users, categories, transactions tables |
| DDL: ALTER TABLE | `schema.sql` — adding created_at column to users and transactions |
| DML: INSERT | `transactionController.js` → addTransaction() |
| DML: UPDATE | `transactionController.js` → updateTransaction() |
| DML: DELETE | `transactionController.js` → deleteTransaction() |
| DML: SELECT | Used throughout all controllers |
| Schema & Instances | `schema.sql` (schema) + `seed.sql` (instances/data) |

### Module III — Operators in SQL
| Concept | Where Demonstrated |
|---------|-------------------|
| Comparison (=, >, <, >=, <=) | `transactionController.js` — date and amount filters |
| Logical (AND, OR) | `transactionController.js` — combining multiple WHERE conditions |
| LIKE pattern matching | `transactionController.js` — search notes with `%keyword%` |

### Module IV — Filtering, Data Sorting & Pagination
| Concept | Where Demonstrated |
|---------|-------------------|
| IN | `transactionController.js` — filter by multiple category IDs |
| BETWEEN | `transactionController.js` — date range filtering |
| ORDER BY | `transactionController.js` — sort by date DESC |
| LIMIT | `transactionController.js` + `summaryController.js` — pagination, recent 5 |
| OFFSET | `transactionController.js` — pagination offset calculation |

### Module V — Aggregations & Grouping
| Concept | Where Demonstrated |
|---------|-------------------|
| SUM | `summaryController.js` — total income/expense |
| COUNT | `summaryController.js` — transaction counts |
| AVG | `summaryController.js` — average transaction amount |
| MIN / MAX | `summaryController.js` — income vs expense comparison |
| ROUND | `summaryController.js` — rounding averages |
| GROUP BY | `summaryController.js` — monthly/category grouping |
| HAVING | `summaryController.js` → getHighSpendingMonths(), getCategorySummary() |

### Module VI — SQL Expressions & Functions
| Concept | Where Demonstrated |
|---------|-------------------|
| Expressions in SELECT | `summaryController.js` — arithmetic in SELECT clause |
| Expressions in WHERE | `transactionController.js` — date comparisons |
| Expressions in HAVING | `summaryController.js` — SUM(amount) > threshold |
| strftime (Date Function) | `schema.sql` VIEW + `summaryController.js` — date formatting |
| CAST Function | `summaryController.js` — CAST count to TEXT, CAST balance to INTEGER |
| Arithmetic (ROUND, +, -, *, /) | `summaryController.js` — percentage calculation, balance |

### Module VII — Case Clause & Set Operations
| Concept | Where Demonstrated |
|---------|-------------------|
| CASE clause | `transactionController.js` — High/Medium/Low spending level |
| CASE in aggregation | `summaryController.js` — conditional SUM for income/expense |
| UNION | `summaryController.js` → getIncomeVsExpense() |

### Module VIII — Database Modeling (ER Model)
| Concept | Where Demonstrated |
|---------|-------------------|
| One-to-Many (users → transactions) | A user has many transactions |
| One-to-Many (categories → transactions) | A category has many transactions |
| FK implementation | `schema.sql` — FOREIGN KEY with ON DELETE CASCADE |
| ER to Relational mapping | Three entities mapped to three tables with FKs |

### Module IX — Joins & Multi-Table Queries
| Concept | Where Demonstrated |
|---------|-------------------|
| INNER JOIN | `transactionController.js` — transactions + users + categories |
| LEFT JOIN | `summaryController.js` → getCategorySummary() — include empty categories |

### Module X — View, Subqueries & Index
| Concept | Where Demonstrated |
|---------|-------------------|
| VIEW (creation) | `schema.sql` — monthly_summary, user_spending_summary |
| Querying using VIEW | `summaryController.js` → getMonthlySummary(), getUserSpending() |
| Subquery (in FROM) | `summaryController.js` → getTopCategory() — nested SELECT |
| Subquery (in WHERE) | `summaryController.js` → getUserSpending() — AVG comparison |
| INDEX | `schema.sql` — indexes on date, category_id, type |

---

## 🔌 API Endpoints

### Transactions (CRUD)
| Method | Endpoint | SQL Concepts |
|--------|----------|-------------|
| GET | `/api/transactions` | JOIN, LIKE, IN, BETWEEN, CASE, ORDER BY, LIMIT/OFFSET |
| POST | `/api/transactions` | INSERT (DML) |
| PUT | `/api/transactions/:id` | UPDATE (DML) |
| DELETE | `/api/transactions/:id` | DELETE (DML) |

### Summary (Analytics)
| Method | Endpoint | SQL Concepts |
|--------|----------|-------------|
| GET | `/api/summary/overview` | SUM, CASE, CAST, Arithmetic |
| GET | `/api/summary/monthly` | VIEW, GROUP BY, strftime |
| GET | `/api/summary/category` | LEFT JOIN, GROUP BY, HAVING, CAST, ROUND |
| GET | `/api/summary/top` | Subquery (in FROM), JOIN |
| GET | `/api/summary/recent` | ORDER BY + LIMIT, JOIN, CASE, strftime |
| GET | `/api/summary/high-spending` | GROUP BY + HAVING, AVG |
| GET | `/api/summary/income-vs-expense` | UNION (Set Operation) |
| GET | `/api/summary/user-spending` | VIEW, Subquery (in WHERE), CASE |
| GET | `/api/summary/users` | SELECT (DML) |
| GET | `/api/summary/categories` | SELECT (DML) |

---

## ✨ Features

- **Dashboard** with income/expense/balance/transaction count cards
- **Monthly Summary** table from SQL VIEW (Module X)
- **Income vs Expense** comparison using UNION (Module VII)
- **User Spending Analysis** using VIEW + Subquery (Module X)
- **High Spending Months** filtered by HAVING (Module V)
- **Recent 5 Transactions** using ORDER BY + LIMIT (Module IV)
- **Top Spending Category** using Subquery (Module X)
- **Category-wise Breakdown** with visual bars and percentage
- **Add/Edit/Delete** transactions (DML — Module II)
- **Pagination** using LIMIT + OFFSET (Module IV)
- **Filters**: search (LIKE — Module III), date range (BETWEEN — Module IV), category (IN — Module IV)
- **Spending Level Badges**: High/Medium/Low (CASE — Module VII)
- **Premium Dark UI**: glassmorphism, gradients, animations

## 👤 Authors

- Jaydeep Mallick
