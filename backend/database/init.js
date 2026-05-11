/**
 * Database Initialization Script
 * --------------------------------
 * Reads schema.sql and seed.sql to create and populate
 * the SQLite database file (expense_tracker.db).
 *
 * Usage: node database/init.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'expense_tracker.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

// Remove existing database to start fresh
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🗑️  Removed existing database.');
}

// Create new database
const db = new Database(DB_PATH);
console.log('📦 Created new database: expense_tracker.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Enable foreign key enforcement
db.pragma('foreign_keys = ON');

try {
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    console.log('✅ Schema created successfully (tables, views, indexes).');

    // Read and execute seed data
    const seed = fs.readFileSync(SEED_PATH, 'utf-8');
    db.exec(seed);
    console.log('✅ Sample data inserted (3 users, 6 categories, 15 transactions).');

    // Verify by counting rows
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    const txnCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();

    console.log(`\n📊 Database Summary:`);
    console.log(`   Users:        ${userCount.count}`);
    console.log(`   Categories:   ${catCount.count}`);
    console.log(`   Transactions: ${txnCount.count}`);
    console.log(`\n🎉 Database initialization complete!`);
} catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
} finally {
    db.close();
}
