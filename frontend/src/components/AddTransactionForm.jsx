import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AddTransactionForm({ onTransactionAdded, defaultUserId }) {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    user_id: '', category_id: '', amount: '', type: 'expense',
    note: '', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [usersRes, categoriesRes] = await Promise.all([
          api.get('/summary/users'), api.get('/summary/categories')
        ]);
        setUsers(usersRes.data);
        setCategories(categoriesRes.data);
        if (defaultUserId) {
          setForm(f => ({ ...f, user_id: defaultUserId }));
        } else if (usersRes.data.length) {
          setForm(f => ({ ...f, user_id: usersRes.data[0].user_id }));
        }
        if (categoriesRes.data.length) setForm(f => ({ ...f, category_id: categoriesRes.data[0].category_id }));
      } catch (err) { console.error('Failed to load form options:', err); }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (defaultUserId) {
      setForm(f => ({ ...f, user_id: defaultUserId }));
    }
  }, [defaultUserId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(''); setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.category_id || !form.amount || !form.date) {
      setError('Please fill in all required fields.'); return;
    }
    if (parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0.'); return; }
    try {
      setSubmitting(true); setError('');
      await api.post('/transactions', {
        ...form, user_id: parseInt(form.user_id),
        category_id: parseInt(form.category_id), amount: parseFloat(form.amount)
      });
      setSuccess(true);
      setForm(prev => ({ ...prev, amount: '', note: '', date: new Date().toISOString().split('T')[0] }));
      if (onTransactionAdded) onTransactionAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="section-title mb-5"><span>➕</span> Add Transaction</h3>
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
          ✅ Transaction added successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          ❌ {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Type</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                form.type === 'expense' ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                : 'bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300'}`}>
              📉 Expense
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'income' }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                form.type === 'income' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-gray-300'}`}>
              📈 Income
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Amount (₹) *</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange}
            placeholder="Enter amount" className="input-field" min="0.01" step="0.01" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">User *</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} className="select-field">
              {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="select-field">
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Note</label>
          <input type="text" name="note" value={form.note} onChange={handleChange}
            placeholder="e.g. Grocery shopping, Salary" className="input-field" />
        </div>
        <button type="submit" disabled={submitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}
