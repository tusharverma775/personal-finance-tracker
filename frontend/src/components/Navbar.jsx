import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (<nav className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
  <div className="max-w-6xl mx-auto px-4">
    <div className="flex justify-between h-16 items-center">
      {/* Left side */}
      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          className="text-xxl font-bold text-white hover:text-blue-100 transition"
        >
          FinanceTracker
        </Link>

        <Link 
          to="/transactions" 
          className="text-sm text-white/90 hover:text-white hover:underline transition"
        >
          Transactions
        </Link>

        <Link 
          to="/analytics" 
          className="text-sm text-white/90 hover:text-white hover:underline transition"
        >
          Analytics
        </Link>

        {user?.role === "admin" && (
          <Link 
            to="/admin/users" 
            className="text-sm text-white/90 hover:text-white hover:underline transition"
          >
            Users
          </Link>
        )}
{user?.role === "admin" && (
          <Link 
            to="/admin/category" 
            className="text-sm text-white/90 hover:text-white hover:underline transition"
          >
            Category
          </Link>
        )}


      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-white">
              {user.email}{" "}
              <span className="text-xs text-blue-200">({user.role})</span>
            </div>
            <button 
              onClick={onLogout} 
              className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
</nav>

  );
}
