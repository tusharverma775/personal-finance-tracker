import React, { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";

export default function VirtualTransactionList({ 
  transactions = [], 
  height = 600,
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction 
}) {
  const [ReactWindow, setReactWindow] = useState(null);
  const items = useMemo(() => transactions || [], [transactions]);

  useEffect(() => {
    import('react-window')
      .then(module => {
        setReactWindow(module);
      })
      .catch(error => {
        console.error('Failed to load react-window:', error);
        setReactWindow(null);
      });
  }, []);

  const Row = ({ index, style }) => {
    const t = items[index];
    if (!t) return null;
    
    return (
      <div style={style} className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white hover:bg-gray-50 group">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {t.title}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {t.description || "No description"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Category: {t.category}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right ml-4 flex-shrink-0">
            <div className={`text-sm font-semibold ${
              t.type === 'expense' ? 'text-red-600' : 'text-green-600'
            }`}>
              {t.type === 'expense' ? '-' : '+'}${t.amount}
            </div>
            <div className="text-xs text-gray-500">
              {dayjs(t.date).isValid() ? dayjs(t.date).format('MMM D, YYYY') : 'Invalid date'}
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
            {onViewTransaction && (
              <button
                onClick={() => onViewTransaction(t.originalData || t)}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="View Details"
              >
                View
              </button>
            )}
            {onEditTransaction && (
              <button
                onClick={() => onEditTransaction(t.originalData || t)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Edit Transaction"
              >
                Edit
              </button>
            )}
            {onDeleteTransaction && (
              <button
                onClick={() => onDeleteTransaction(t.originalData || t)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Delete Transaction"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (ReactWindow === null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  if (!ReactWindow || !ReactWindow.FixedSizeList) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div style={{ height, overflow: 'auto' }}>
          {items.map((t, index) => (
            <div key={t.id || index} className="flex items-center justify-between px-4 py-3 border-b border-gray-200 hover:bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {t.title}
                </div>
                <div className="text-xs text-gray-500">
                  {t.description || "No description"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Category: {t.category}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right ml-4">
                  <div className={`text-sm font-semibold ${
                    t.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {t.type === 'expense' ? '-' : '+'}${t.amount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dayjs(t.date).isValid() ? dayjs(t.date).format('MMM D, YYYY') : 'Invalid date'}
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  {onViewTransaction && (
                    <button
                      onClick={() => onViewTransaction(t.originalData || t)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      View
                    </button>
                  )}
                  {onEditTransaction && (
                    <button
                      onClick={() => onEditTransaction(t.originalData || t)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(t.originalData || t)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const List = ReactWindow.FixedSizeList;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="text-gray-500">No transactions found</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <List
        height={height}
        itemCount={items.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}