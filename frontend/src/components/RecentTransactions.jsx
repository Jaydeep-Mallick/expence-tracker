/**
 * RecentTransactions Component
 * -----------------------------
 * Shows the last 5 transactions.
 * Demonstrates ORDER BY + LIMIT from the backend.
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function RecentTransactions({ refreshKey, globalUserId }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const params = globalUserId ? { user_id: globalUserId } : {};
        const res = await api.get('/summary/recent', { params });
        setRecent(res.data);
      } catch (err) {
        console.error('Failed to fetch recent:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [refreshKey, globalUserId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return <div className="glass-card p-6 h-48 loading-shimmer" />;
  }

  return (
    <div className="glass-card p-6">
      <h3 className="section-title mb-4">
        <span>🕐</span> Recent Transactions
      </h3>
      <div className="space-y-3">
        {recent.map((txn) => (
          <div
            key={txn.transaction_id}
            className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-200 truncate">{txn.note || txn.category_name}</p>
              <p className="text-xs text-gray-500">{txn.category_name} · {txn.date}</p>
            </div>
            <span className={`text-sm font-semibold ml-3 ${txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </span>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
