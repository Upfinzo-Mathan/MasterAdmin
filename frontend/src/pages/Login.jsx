import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Try SuperAdmin login first
      try {
        const { data } = await api.post('/superadmin/login', { username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'superadmin');
        navigate('/superadmin');
        return;
      } catch (superAdminError) {
        // If SuperAdmin login fails with 401, try Admin login
        if (superAdminError?.response?.status === 401 || superAdminError?.response?.status === 500) {
          try {
        const { data } = await api.post('/admin/login', { username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('dbName', data.dbName);
        localStorage.setItem('selectedFields', JSON.stringify(data.selectedFields || []));
        localStorage.setItem('company', JSON.stringify(data.company || {}));
        navigate('/admin');
            return;
          } catch (adminError) {
            // Both logins failed
            const errorMessage = adminError?.response?.data?.message || superAdminError?.response?.data?.message || 'Invalid credentials. Please try again.';
            setError(errorMessage);
          }
        } else {
          // SuperAdmin login failed with non-auth error
          const errorMessage = superAdminError?.response?.data?.message || superAdminError?.response?.data?.error || 'Login failed. Please try again.';
          setError(errorMessage);
        }
      }
    } catch (err) {
      // Unexpected error
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-6xl font-bold text-white">UzO</span>
              <div className="w-16 h-16 rounded-full bg-cyan-400 shadow-lg"></div>
              <span className="text-6xl font-bold text-white">LEADS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your username and password to sign in!</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forget password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-bold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 UzOLeads. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

