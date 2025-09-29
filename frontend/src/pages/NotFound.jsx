import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="mb-6">Page not found</p>
        <Link to="/" className="px-4 py-2 bg-primary-500 text-white rounded">Go Home</Link>
      </div>
    </div>
  );
}
