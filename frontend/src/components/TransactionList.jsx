/**
 * TransactionList Component
 * --------------------------
 * Table of all transactions with pagination (LIMIT/OFFSET),
 * edit/delete functionality, and spending level badges (CASE).
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function TransactionList({ filters, refreshKey, onTransactionChanged, globalUserId }) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch lookup data for edit form
  useEffect(() => {
    Promise.all([api.get('/summary/categories'), api.get('/summary/users')])
      .then(([catRes, userRes]) => { setCategories(catRes.data); setUsers(userRes.data); })
      .catch(console.error);
  }, []);

  // Fetch transactions when filters or page changes
  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, refreshKey, globalUserId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page, limit: pagination.limit,
        ...(filters?.search && { search: filters.search }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.type && { type: filters.type }),
        ...(globalUserId && { user_id: globalUserId })
      };
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) { console.error('Failed to fetch transactions:', err);
    } finally { setLoading(false); }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      if (onTransactionChanged) onTransactionChanged();
    } catch (err) { console.error('Failed to delete:', err); }
  };

  const startEdit = (txn) => {
    setEditingId(txn.transaction_id);
    setEditForm({
      user_id: txn.user_id, category_id: txn.category_id,
      amount: txn.amount, type: txn.type, note: txn.note, date: txn.date
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    try {
      await api.put(`/transactions/${id}`, {
        ...editForm, user_id: parseInt(editForm.user_id),
        category_id: parseInt(editForm.category_id), amount: parseFloat(editForm.amount)
      });
      setEditingId(null);
      if (onTransactionChanged) onTransactionChanged();
    } catch (err) { console.error('Failed to update:', err); }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  const getBadgeClass = (level) => {
    if (level === 'High') return 'badge-high';
    if (level === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title"><span>📋</span> Transactions</h3>
        <span className="text-xs text-gray-500">{pagination.total} total</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 loading-shimmer rounded-lg" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📭</p><p>No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>User</th><th>Category</th><th>Note</th>
                <th>Type</th><th>Amount</th><th>Level</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.transaction_id}>
                  {editingId === txn.transaction_id ? (
                    <>
                      <td><input type="date" value={editForm.date}
                        onChange={e => setEditForm({...editForm, date: e.target.value})}
                        className="input-field text-xs py-1 px-2" /></td>
                      <td><select value={editForm.user_id}
                        onChange={e => setEditForm({...editForm, user_id: e.target.value})}
                        className="select-field text-xs py-1 px-2">
                        {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                      </select></td>
                      <td><select value={editForm.category_id}
                        onChange={e => setEditForm({...editForm, category_id: e.target.value})}
                        className="select-field text-xs py-1 px-2">
                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                      </select></td>
                      <td><input type="text" value={editForm.note}
                        onChange={e => setEditForm({...editForm, note: e.target.value})}
                        className="input-field text-xs py-1 px-2" /></td>
                      <td><select value={editForm.type}
                        onChange={e => setEditForm({...editForm, type: e.target.value})}
                        className="select-field text-xs py-1 px-2">
                        <option value="expense">Expense</option><option value="income">Income</option>
                      </select></td>
                      <td><input type="number" value={editForm.amount}
                        onChange={e => setEditForm({...editForm, amount: e.target.value})}
                        className="input-field text-xs py-1 px-2 w-24" /></td>
                      <td>—</td>
                      <td className="space-x-1">
                        <button onClick={() => saveEdit(txn.transaction_id)} className="btn-success">Save</button>
                        <button onClick={cancelEdit} className="btn-secondary text-xs px-2 py-1">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap">{txn.date}</td>
                      <td>{txn.user_name}</td>
                      <td>{txn.category_name}</td>
                      <td className="max-w-[200px] truncate">{txn.note}</td>
                      <td><span className={txn.type === 'income' ? 'badge-income' : 'badge-expense'}>{txn.type}</span></td>
                      <td className={`font-semibold ${txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td><span className={getBadgeClass(txn.spending_level)}>{txn.spending_level}</span></td>
                      <td className="space-x-1">
                        <button onClick={() => startEdit(txn)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                        <button onClick={() => handleDelete(txn.transaction_id)} className="btn-danger">Del</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1} className="btn-secondary text-xs disabled:opacity-30">← Prev</button>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages} className="btn-secondary text-xs disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
