import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Briefcase, UserCog } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('Demo123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'OFFICER') {
        navigate('/officer');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">SUVIDHA</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium">AI-Driven Industrial Approval & Compliance Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-10">
          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              SIH Evaluator Quick Fill:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => quickFill('demo@example.com', 'Demo123!')}
                className="px-2 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold hover:bg-sky-100 flex flex-col items-center gap-1 transition"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Entrepreneur</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('officer@example.com', 'Demo123!')}
                className="px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 flex flex-col items-center gap-1 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Officer</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@example.com', 'Demo123!')}
                className="px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 flex flex-col items-center gap-1 transition"
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Official Email
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              New industrial applicant?{' '}
              <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                Register Enterprise
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
