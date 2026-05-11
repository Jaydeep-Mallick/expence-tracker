/**
 * App Component — Smart Expense Tracker
 * Main layout combining Dashboard, AddTransactionForm, Filters, and TransactionList.
 */
import { useState, useCallback, useEffect } from 'react';
import api from './api/axios';
import Dashboard from './components/Dashboard';
import AddTransactionForm from './components/AddTransactionForm';
import Filters from './components/Filters';
import TransactionList from './components/TransactionList';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({});
  const [globalUserId, setGlobalUserId] = useState('');
  const [users, setUsers] = useState([]);

  // Trigger data refresh across all components
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    api.get('/summary/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-xl font-bold gradient-text">Smart Expense Tracker</h1>
              <p className="text-xs text-gray-500">DBMS Project — Single Page View</p>
            </div>
          </div>
          {/* Global User Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">View Data For:</label>
            <select 
              value={globalUserId} 
              onChange={(e) => setGlobalUserId(e.target.value)}
              className="select-field text-sm w-48"
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        
        {/* Dashboard Section */}
        <section>
          <Dashboard refreshKey={refreshKey} globalUserId={globalUserId} />
        </section>

        {/* Add Transaction Section */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>➕</span> Add New Transaction
          </h2>
          <AddTransactionForm 
            onTransactionAdded={refresh} 
            defaultUserId={globalUserId} 
          />
        </section>

        {/* Transactions Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📋</span> Transaction History
          </h2>
          <Filters onFilterChange={setFilters} />
          <TransactionList 
            filters={filters} 
            refreshKey={refreshKey} 
            onTransactionChanged={refresh} 
            globalUserId={globalUserId}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-600">
          Smart Expense Tracker — DBMS Project | Built with React + Express + SQLite
        </div>
      </footer>
    </div>
  );
}
