import React from 'react';
import dayjs from 'dayjs';

export default function TransactionDetails({ transaction, onClose, onEdit, onDelete }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900">{transaction.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className={`mt-1 text-sm font-semibold ${
                  transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${parseFloat(transaction.amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.description || 'No description'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <p className="mt-1 text-sm text-gray-900">
                {transaction.Category?.name || transaction.category || 'Uncategorized'}
                {transaction.categoryId && ` (ID: ${transaction.categoryId})`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dayjs(transaction.date).isValid() 
                    ? dayjs(transaction.date).format('MMM D, YYYY')
                    : 'Invalid date'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dayjs(transaction.createdAt).format('MMM D, YYYY HH:mm')}
                </p>
              </div>
            </div>

            {transaction.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{transaction.notes}</p>
              </div>
            )}

            {transaction.userId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900">{transaction.userId}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(transaction)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}