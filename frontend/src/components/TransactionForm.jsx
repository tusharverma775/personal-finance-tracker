import React, { useState, useContext, useEffect } from 'react';
import client from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';

export default function TransactionForm({ onSubmit, onCancel, editingTransaction = null }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date as default
    notes: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // If editing, populate form with transaction data
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount || '',
        type: editingTransaction.type || 'income',
        categoryId: editingTransaction.categoryId || '',
        description: editingTransaction.description || '',
        date: editingTransaction.date || new Date().toISOString().split('T')[0],
        notes: editingTransaction.notes || ''
      });
    }
  }, [editingTransaction]);

  const fetchCategories = async () => {
    try {
      const res = await client.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare payload according to your API requirements
      const payload = {
        amount: parseFloat(formData.amount).toFixed(2),
        type: formData.type,
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        date: formData.date,
        notes: formData.notes
      };

      let response;
      if (editingTransaction) {
        // Update existing transaction
        response = await client.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        // Create new transaction
        response = await client.post('/transactions', payload);
      }

      // Call the onSubmit callback with the response data
      if (onSubmit) {
        onSubmit(response.data.data);
      }

      // Reset form if it's a new transaction
      if (!editingTransaction) {
        setFormData({
          amount: '',
          type: 'income',
          categoryId: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }

    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError(
        err.response?.data?.message || 
        `Failed to ${editingTransaction ? 'update' : 'create'} transaction. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">
        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter transaction description"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes (optional)"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded text-black-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-black rounded hover:bg-primary-600 disabled:opacity-50"
          > 
         {loading ? 'Saving...' : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
          </button>
        </div>
      </form>
    </div>
  );
}