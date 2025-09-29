import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import VirtualTransactionList from "../components/VirtualTransactionList";
import RoleGate from "../components/RoleGate";
import useDebounce from "../hooks/useDebounce";
import TransactionForm from "../components/TransactionForm";
import TransactionDetails from "../components/TransactionDetails";

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch transactions
  const fetchTx = useCallback(async (q, p = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/transactions", {
        params: { q: q || undefined, page: p, perPage },
      });
      
      setTransactions(res.data.data || []);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setPage(res.data.meta.page || 1);
      } else {
        setTotalPages(Math.ceil((res.data.data?.length || 0) / perPage));
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(
        err.response?.data?.message || "Failed to fetch transactions. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchTx(debouncedQuery, page);
  }, [debouncedQuery, page, fetchTx]);

  // Handle Add Transaction button click
  const handleAddTransaction = () => {
    setShowForm(true);
    setEditingTransaction(null); // Ensure we're in create mode
  };

  // Handle form submission (Create/Update)
  const handleFormSubmit = useCallback(async (transactionData) => {
    try {
      setError("");
      setSuccessMessage("");
      
      let response;
      if (editingTransaction) {
        // Update existing transaction
        response = await client.put(`/transactions/${editingTransaction.id}`, transactionData);
        setSuccessMessage("Transaction updated successfully!");
      } else {
        // Create new transaction - using your exact API format
        const payload = {
          amount: transactionData.amount,
          type: transactionData.type,
          categoryId: parseInt(transactionData.categoryId),
          description: transactionData.description,
          date: transactionData.date,
          notes: transactionData.notes
        };
        
        response = await client.post("/transactions", payload);
        setSuccessMessage("Transaction created successfully!");
      }

      // Refresh the transactions list
      await fetchTx(debouncedQuery, page);
      
      // Close form and reset editing state
      setShowForm(false);
      setEditingTransaction(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      console.error("Failed to save transaction:", err);
      setError(
        err.response?.data?.message || `Failed to ${editingTransaction ? 'update' : 'create'} transaction. Try again.`
      );
    }
  }, [fetchTx, debouncedQuery, page, editingTransaction]);

  // Handle view transaction
  const handleViewTransaction = useCallback((transaction) => {
    setViewingTransaction(transaction);
  }, []);

  // Handle edit transaction
  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setViewingTransaction(null); // Close details if open
  }, []);

  // Handle delete transaction
  const handleDeleteTransaction = useCallback(async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete transaction #${transaction.id}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      await client.delete(`/transactions/${transaction.id}`);
      setSuccessMessage("Transaction deleted successfully!");
      
      // Refresh the list
      await fetchTx(debouncedQuery, page);
      
      // Close any open modals
      setViewingTransaction(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError(
        err.response?.data?.message || "Failed to delete transaction. Try again."
      );
    }
  }, [fetchTx, debouncedQuery, page]);

  // Handle delete from details view
  const handleDeleteFromDetails = useCallback((transaction) => {
    setViewingTransaction(null);
    handleDeleteTransaction(transaction);
  }, [handleDeleteTransaction]);

  // Handle edit from details view
  const handleEditFromDetails = useCallback((transaction) => {
    setViewingTransaction(null);
    handleEditTransaction(transaction);
  }, [handleEditTransaction]);

  // Handle cancel form
  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingTransaction(null);
  }, []);

  // Handle close details
  const handleCloseDetails = useCallback(() => {
    setViewingTransaction(null);
  }, []);

  // Format transactions for the virtual list
  const formattedTransactions = useMemo(() => {
    return transactions.map(transaction => ({
      id: transaction.id,
      amount: parseFloat(transaction.amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      type: transaction.type,
      description: transaction.description,
      date: transaction.date,
      category: transaction.Category?.name || 'Uncategorized',
      title: `Transaction #${transaction.id}`,
      // Include original data for actions
      originalData: transaction
    }));
  }, [transactions]);

  return (
    <div className="p-6">
      {/* Header with Add Transaction Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <RoleGate allow={["admin", "user","read-only"]}>
            <button
              onClick={handleAddTransaction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Transaction</span>
            </button>
          </RoleGate>
        </div>
        
        {/* Optional: Add summary stats here */}
        <div className="text-sm text-gray-500">
          {transactions.length > 0 && `Showing ${transactions.length} transactions`}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 text-green-800 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading transactions...
          </div>
        </div>
      )}

      {/* Transaction Form */}
      {showForm && (
        <div className="mb-6">
          <TransactionForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            editingTransaction={editingTransaction}
          />
        </div>
      )}

      {/* Transaction Details Modal */}
      {viewingTransaction && (
        <TransactionDetails
          transaction={viewingTransaction}
          onClose={handleCloseDetails}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteFromDetails}
        />
      )}

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions by description, category, or amount..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Virtual Transaction List */}
      <VirtualTransactionList 
        transactions={formattedTransactions}
        height={600}
        onViewTransaction={handleViewTransaction}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages} 
          {transactions.length > 0 && ` • ${transactions.length} transactions`}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center space-x-1"
          >
            <span>Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}