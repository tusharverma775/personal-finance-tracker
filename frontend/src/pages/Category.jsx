import React, { useEffect, useState, useContext } from "react";
import client from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";


export default function Category(){
 const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  
  const isAdmin = currentUser?.role === 'admin';

   useEffect(() => {
    fetchCategories();
  }, []);

  
  const fetchCategories = () => {
    setLoading(true);
    client
      .get("/categories")
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch categories";
        setError(msg);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  };




const handleAddCategory = () => {
    if (!isAdmin) {
      alert("You don't have permission to add categories");
      return;
    }
    setEditingCategory(null);
    setShowForm(true);
  };

  
  const handleEditCategory = (category) => {
    if (!isAdmin) {
      alert("You don't have permission to edit categories");
      return;
    }
    setEditingCategory(category);
    setShowForm(true);
  };


  const handleDeleteCategory = (category) => {
    if (!isAdmin) {
      alert("You don't have permission to delete categories");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    client
      .delete(`/categories/${category.id}`)
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        alert("Category deleted successfully");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete category";
        alert(msg);
      });
  };
const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      alert("You don't have permission to modify categories");
      return;
    }

    const formData = new FormData(e.target);
    const name = formData.get('name').trim();

    if (!name) {
      alert("Category name is required");
      return;
    }

    const payload = { name };

    if (editingCategory) {
      // Update category
      client
        .put(`/categories/${editingCategory.id}`, payload)
        .then((res) => {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? res.data.data : c))
          );
          alert("Category updated successfully");
        })
        .catch((err) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to update category";
          alert(msg);
        })
        .finally(() => {
          setShowForm(false);
          setEditingCategory(null);
        });
    } else {
      // Create category
      client
        .post("/categories", payload)
        .then((res) => {
          setCategories((prev) => [...prev, res.data.data]);
          alert("Category created successfully");
        })
        .catch((err) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to create category";
          alert(msg);
        })
        .finally(() => {
          setShowForm(false);
        });
    }
  };

  const CategoryForm = () => {
    if (!showForm) return null;




    return(
        
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={editingCategory?.name || ''}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Logged in as: <span className="capitalize font-semibold">{currentUser?.role || 'Unknown'}</span>
          </div>
          {isAdmin && (
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {!isAdmin && (
        <div className="mb-4 p-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg">
          <strong>Note:</strong> You need admin privileges to manage categories.
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-700 uppercase text-sm">
                <th className="px-4 py-3 border">ID</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, i) => (
                <tr
                  key={category.id}
                  className={`border-t ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-3">{category.id}</td>
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        disabled={!isAdmin}
                        className={`px-3 py-1 text-sm rounded transition ${
                          !isAdmin
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={!isAdmin ? "Admin access required to edit categories" : "Edit category"}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        disabled={!isAdmin}
                        className={`px-3 py-1 text-sm rounded transition ${
                          !isAdmin
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={!isAdmin ? "Admin access required to delete categories" : "Delete category"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryForm />
    </div>
    )
}