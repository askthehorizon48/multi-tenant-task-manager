import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgMode, setOrgMode] = useState('create'); // 'create' or 'join'
  const [organizationName, setOrganizationName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      name,
      email,
      password,
    };

    if (orgMode === 'create') {
      if (!organizationName) return setError('Organization Name is required');
      payload.organizationName = organizationName;
    } else {
      if (!organizationId) return setError('Organization ID is required');
      payload.organizationId = organizationId;
    }

    try {
      await axios.post('http://localhost:3000/auth/register', payload);
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Task Manager Register</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Organization</label>
            <div className="flex space-x-4 mb-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-500"
                  value="create"
                  checked={orgMode === 'create'}
                  onChange={() => setOrgMode('create')}
                />
                <span className="ml-2 text-sm text-gray-700">Create New (Admin)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-500"
                  value="join"
                  checked={orgMode === 'join'}
                  onChange={() => setOrgMode('join')}
                />
                <span className="ml-2 text-sm text-gray-700">Join Existing (Member)</span>
              </label>
            </div>

            {orgMode === 'create' ? (
              <div>
                <input
                  type="text"
                  placeholder="New Organization Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required={orgMode === 'create'}
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Existing Organization ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  required={orgMode === 'join'}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors mt-6"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
