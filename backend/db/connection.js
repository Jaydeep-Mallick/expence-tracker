/**
 * Database Connection Module
 * ---------------------------
 * Creates and exports a reusable better-sqlite3 connection.
 * Enables WAL mode for performance and foreign key enforcement.
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'expense_tracker.db');

const db = new Database(DB_PATH);

// Enable Write-Ahead Logging for better concurrent read performance
db.pragma('journal_mode = WAL');

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

module.exports = db;
