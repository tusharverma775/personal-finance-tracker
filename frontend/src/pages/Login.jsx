import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message)
      setErr(error?.response?.data?.message || "Login failed");
    }
  }

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <form 
    onSubmit={onSubmit} 
    className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
  >
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>

    {err && (
      <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{err}</div>
    )}

    <label className="block mb-5">
      <span className="text-gray-600 font-medium">Email</span>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="you@example.com"
        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-100 transition-all duration-200"
      />
    </label>

    <label className="block mb-6">
      <span className="text-gray-600 font-medium">Password</span>
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="••••••••"
        className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-100 transition-all duration-200"
      />
    </label>

    <button 
      type="submit" 
      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
    >
      Sign In
    </button>

    <p className="mt-6 text-center text-sm text-gray-500">
      Don’t have an account?  <a href="/register" className="text-blue-600 hover:underline">Sign Up</a>
    </p>
  </form>
</div>

  );
}
