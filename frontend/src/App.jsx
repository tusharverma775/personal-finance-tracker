import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary"

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const UsersAdmin = lazy(() => import("./pages/UsersAdmin"));
const Category = lazy(() => import("./pages/Category"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));



function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
       
          <Navbar />
          <Suspense fallback={<Spinner />}>
                <ErrorBoundary>   
            <Routes>
           
              <Route path="/login" element={<Login />} /> 
           
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/users" element={<UsersAdmin />} />
                <Route path = "/admin/category" element= { <Category/>}/>
              </Route>

              <Route path="*" element={<NotFound />} />
         
            </Routes>
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
