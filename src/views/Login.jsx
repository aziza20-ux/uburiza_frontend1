import React, { useState } from 'react';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLoginMutation } from '../api/hooks/useAuthMutations';
import { getAuthErrorMessage, persistSession } from '../api/auth-session';
import { btnPrimary, inputWithIcon, label, alertError } from '../lib/tokens';

export default function Login({ setView, setPendingEmail }) {
  const { setUser, setUserRole } = useAppContext();
  const loginMutation = useLoginMutation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = () => {
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    setError('');
    loginMutation.mutate(formData, {
      onSuccess: (data) => setView(persistSession(data, { setUser, setUserRole })),
      onError: (err) => {
        if (err.error === 'Please verify your email first.') {
          setPendingEmail(formData.email);
          setView('VerifyEmail');
          return;
        }
        setError(getAuthErrorMessage(err, 'Invalid credentials'));
      },
    });
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1e4c31] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <button onClick={() => setView('LandingPage')} className="relative flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          Uburiza Learn
        </button>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
            Welcome back to your learning journey.
          </h1>
          <p className="text-emerald-200 text-sm leading-relaxed">
            Continue mastering the skills that will shape the future of Africa's digital economy.
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://i.pravatar.cc/150?img=${i + 15}`} alt="" className="w-8 h-8 rounded-full border-2 border-[#1e4c31] object-cover" />
            ))}
          </div>
          <p className="text-sm text-emerald-200">Join 50k+ active learners</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Mobile logo */}
        <button onClick={() => setView('LandingPage')} className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-[#1e4c31] font-bold">
          <div className="w-7 h-7 rounded-lg bg-[#1e4c31] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          Uburiza Learn
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Log in to your account</h2>
            <p className="text-sm text-gray-500">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className={`${alertError} mb-5`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className={label} htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputWithIcon}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                <button onClick={() => setView('ForgotPassword')} className="text-xs font-medium text-[#1e4c31] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password" type="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className={inputWithIcon}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className={`${btnPrimary} w-full mt-2`}
            >
              {loginMutation.isPending ? 'Logging in…' : 'Log In'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button onClick={() => setView('Signup')} className="font-semibold text-[#1e4c31] hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
