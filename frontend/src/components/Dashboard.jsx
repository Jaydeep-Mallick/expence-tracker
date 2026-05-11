/**
 * Dashboard Component
 * --------------------
 * Displays overview cards, monthly summary, recent transactions,
 * top category, income vs expense comparison (UNION), and user spending analysis.
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import RecentTransactions from './RecentTransactions';
import TopCategory from './TopCategory';

export default function Dashboard({ refreshKey, globalUserId }) {
  const [overview, setOverview] = useState({ total_income: 0, total_expense: 0, balance: 0, total_transactions: 0 });
  const [monthly, setMonthly] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [userSpending, setUserSpending] = useState([]);
  const [highMonths, setHighMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = globalUserId ? { user_id: globalUserId } : {};
        const [overviewRes, monthlyRes, iveRes, userRes, highRes] = await Promise.all([
          api.get('/summary/overview', { params }),
          api.get('/summary/monthly', { params }),
          api.get('/summary/income-vs-expense', { params }),
          api.get('/summary/user-spending', { params }),
          api.get('/summary/high-spending', { params: { ...params, threshold: 5000 } })
        ]);
        setOverview(overviewRes.data);
        setMonthly(monthlyRes.data);
        setIncomeVsExpense(iveRes.data);
        setUserSpending(userRes.data);
        setHighMonths(highRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, globalUserId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="stat-card h-32 loading-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ---- Overview Cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:bg-emerald-500/15 transition-all" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📈</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Income</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(overview.total_income)}</p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:bg-red-500/15 transition-all" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📉</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Expenses</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(overview.total_expense)}</p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:bg-brand-500/15 transition-all" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Net Balance</span>
            </div>
            <p className={`text-3xl font-bold ${overview.balance >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
              {formatCurrency(overview.balance)}
            </p>
          </div>
        </div>

        <div className="stat-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:bg-amber-500/15 transition-all" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔢</span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Transactions</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{overview.total_transactions}</p>
          </div>
        </div>
      </div>

      {/* ---- Income vs Expense (UNION) ---- */}
      {incomeVsExpense.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="section-title mb-4">
            <span>⚖️</span> Income vs Expense Comparison
            <span className="text-xs font-normal text-gray-500 ml-2">(UNION — Module VII)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomeVsExpense.map(row => (
              <div key={row.summary_type}
                className={`p-4 rounded-xl border ${
                  row.summary_type === 'Income'
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : 'bg-red-500/5 border-red-500/15'}`}>
                <h4 className={`text-lg font-bold mb-3 ${
                  row.summary_type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {row.summary_type === 'Income' ? '📈' : '📉'} {row.summary_type}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Count</p>
                    <p className="text-gray-200 font-medium">{row.count} txns</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="text-gray-200 font-medium">{formatCurrency(row.total)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Average</p>
                    <p className="text-gray-200 font-medium">{formatCurrency(row.average)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Min / Max</p>
                    <p className="text-gray-200 font-medium">{formatCurrency(row.minimum)} — {formatCurrency(row.maximum)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Monthly Summary + Recent + Top ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="section-title mb-4">
            <span>📊</span> Monthly Summary
            <span className="text-xs font-normal text-gray-500 ml-2">(VIEW — Module X)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th><th>Income</th><th>Expense</th><th>Balance</th><th>Avg Txn</th><th>Count</th>
                </tr>
              </thead>
              <tbody>
                {monthly.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-gray-500 py-8">No data yet</td></tr>
                ) : monthly.map(row => (
                  <tr key={row.month}>
                    <td className="font-medium text-gray-200">{formatMonth(row.month)}</td>
                    <td className="text-emerald-400">{formatCurrency(row.total_income)}</td>
                    <td className="text-red-400">{formatCurrency(row.total_expense)}</td>
                    <td className={row.balance >= 0 ? 'text-brand-400' : 'text-red-400'}>{formatCurrency(row.balance)}</td>
                    <td className="text-gray-400">{formatCurrency(row.avg_transaction)}</td>
                    <td>
                      <span className="bg-white/[0.06] px-2.5 py-1 rounded-lg text-xs font-medium">{row.transaction_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <RecentTransactions refreshKey={refreshKey} globalUserId={globalUserId} />
          <TopCategory refreshKey={refreshKey} globalUserId={globalUserId} />
        </div>
      </div>

      {/* ---- Bottom Row: User Spending + High Spending Months ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Spending (VIEW + Subquery) */}
        <div className="glass-card p-6">
          <h3 className="section-title mb-4">
            <span>👤</span> User Spending Analysis
            <span className="text-xs font-normal text-gray-500 ml-2">(VIEW + Subquery — Module X)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>User</th><th>Earned</th><th>Spent</th><th>Txns</th><th>Status</th></tr></thead>
              <tbody>
                {userSpending.map(u => (
                  <tr key={u.user_id}>
                    <td className="font-medium text-gray-200">{u.name}</td>
                    <td className="text-emerald-400">{formatCurrency(u.total_earned)}</td>
                    <td className="text-red-400">{formatCurrency(u.total_spent)}</td>
                    <td>{u.total_transactions}</td>
                    <td>
                      <span className={u.spending_status === 'Above Average' ? 'badge-high' : 'badge-low'}>
                        {u.spending_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Spending Months (HAVING) */}
        <div className="glass-card p-6">
          <h3 className="section-title mb-4">
            <span>🔥</span> High Spending Months
            <span className="text-xs font-normal text-gray-500 ml-2">(HAVING — Module V)</span>
          </h3>
          {highMonths.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No months above ₹5,000 threshold</p>
          ) : (
            <div className="space-y-3">
              {highMonths.map(m => (
                <div key={m.month} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{formatMonth(m.month)}</p>
                    <p className="text-xs text-gray-500">{m.num_transactions} transactions · avg {formatCurrency(m.avg_per_transaction)}</p>
                  </div>
                  <span className="text-red-400 font-bold">{formatCurrency(m.total_expense)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
