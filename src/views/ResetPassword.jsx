import React, { useState } from 'react';
import { Activity, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResetPasswordMutation } from '../api/hooks/useAuthMutations';
import { getAuthErrorMessage } from '../api/auth-session';

export default function ResetPassword({ setView, token, email }) {
  const resetPasswordMutation = useResetPasswordMutation();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!token || !email) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center px-8">
          <p className="text-black font-bold mb-4">Invalid or missing reset link.</p>
          <button onClick={() => setView('ForgotPassword')} className="text-emerald-700 underline font-bold">
            Request a new one
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    resetPasswordMutation.mutate(
      { email, token, password: formData.password },
      {
        onSuccess: (data) => {
          setMessage(data.message);
        },
        onError: (err) => {
          setError(getAuthErrorMessage(err, 'Failed to reset password. The link may have expired.'));
        },
      }
    );
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-8"
      >
        <div
          className="flex items-center space-x-2 text-emerald-800 font-bold text-xl mb-10 cursor-pointer w-fit"
          onClick={() => setView('LandingPage')}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span>Uburiza Learn</span>
        </div>

        <h2 className="text-3xl font-bold text-black mb-2">Set new password</h2>
        <p className="text-black text-sm mb-8">
          Resetting password for <span className="font-bold">{email}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-white border border-black text-black font-bold rounded-xl text-sm">{error}</div>
        )}

        {message ? (
          <div className="p-4 bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold rounded-xl text-sm mb-6">
            {message}
            <button
              onClick={() => setView('Login')}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-10 py-3 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group"
            >
              <span>{resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}</span>
              {!resetPasswordMutation.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
