/**
 * TopCategory Component
 * ----------------------
 * Displays the highest spending category.
 * Demonstrates Subquery usage from the backend.
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function TopCategory({ refreshKey, globalUserId }) {
  const [top, setTop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = globalUserId ? { user_id: globalUserId } : {};
        const [topRes, catRes] = await Promise.all([
          api.get('/summary/top', { params }),
          api.get('/summary/category', { params })
        ]);
        setTop(topRes.data);
        // Sort by expense, filter out zero-spend categories
        setCategories(catRes.data.filter(c => c.total_expense > 0).slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch top category:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, globalUserId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return <div className="glass-card p-6 h-48 loading-shimmer" />;
  }

  // Calculate max for bar widths
  const maxExpense = categories.length > 0 ? Math.max(...categories.map(c => c.total_expense)) : 1;

  return (
    <div className="glass-card p-6">
      <h3 className="section-title mb-4">
        <span>🏆</span> Top Categories
        <span className="text-xs font-normal text-gray-500 ml-2">(subquery)</span>
      </h3>

      {/* Highlight top category */}
      {top && top.category_name !== 'N/A' && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400/80 uppercase tracking-wide font-medium">Highest Spending</p>
          <p className="text-lg font-bold text-amber-400">{top.category_name}</p>
          <p className="text-sm text-amber-400/70">{formatCurrency(top.total_spent)}</p>
        </div>
      )}

      {/* Category bars */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.category_id}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">{cat.category_name}</span>
              <span className="text-gray-400">{formatCurrency(cat.total_expense)}</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${(cat.total_expense / maxExpense) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
