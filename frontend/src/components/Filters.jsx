/**
 * Filters Component
 * ------------------
 * Provides date range (BETWEEN), category dropdown, and search (LIKE) filters.
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Filters({ onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '', startDate: '', endDate: '', category: '', type: ''
  });

  useEffect(() => {
    api.get('/summary/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared = { search: '', startDate: '', endDate: '', category: '', type: '' };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title"><span>🔍</span> Filters</h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search by note (LIKE) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search Notes</label>
          <input type="text" name="search" value={filters.search} onChange={handleChange}
            placeholder="Search..." className="input-field text-sm" />
        </div>
        {/* Date range (BETWEEN) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">From Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange}
            className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange}
            className="input-field text-sm" />
        </div>
        {/* Category filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select name="category" value={filters.category} onChange={handleChange} className="select-field text-sm">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>
        {/* Type filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select name="type" value={filters.type} onChange={handleChange} className="select-field text-sm">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
    </div>
  );
}
