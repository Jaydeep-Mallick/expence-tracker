/**
 * Smart Expense Tracker — Express Server
 * ----------------------------------------
 * Main entry point for the backend API.
 * Configures middleware, mounts routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');

const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 5001;

// ---- Middleware ----

// Enable CORS for frontend (React dev server)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// ---- Routes ----

// Transaction CRUD operations
app.use('/api/transactions', transactionRoutes);

// Summary and analytics endpoints
app.use('/api/summary', summaryRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Expense Tracker API is running' });
});

// ---- Error Handling ----

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ---- Start Server ----

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
