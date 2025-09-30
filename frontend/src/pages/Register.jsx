import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");

  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ email, password, name ,role });
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Registration failed");
     
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-50">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        {err && <div className="mb-2 text-sm text-red-600">{err}</div>}
        <label className="block mb-2">
          <span className="text-sm">Name</span>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2"/>
        </label>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2"/>
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2"/>
        </label>
        <label className="block mb-4">
           <span className="text-sm">Role</span>
        <select id="role"
                name="role" 
                value={role}
                required
                onChange={e => setRole(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2 ">
      

          <option value = "admin">Admin</option>
          <option value = "user">User</option>
         

          <option value = "read-only">Read-Only</option>

        </select> </label> 
         {/* <label className="block mb-4">
          <span className="text-sm">Role</span>
          <input type="Role" value={role} onChange={e=>setRole(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2"/>
        </label> */}
        <button type="submit" className="w-full bg-blue-500 text-black bg-clip-padding-xl
         py-2 rounded">Create account</button>
      </form>
    </div>
  );
}
