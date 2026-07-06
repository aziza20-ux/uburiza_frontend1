import React, { useState } from 'react';
import { Activity, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForgotPasswordMutation } from '../api/hooks/useAuthMutations';
import { getAuthErrorMessage } from '../api/auth-session';

export default function ForgotPassword({ setView }) {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setMessage(data.message);
        },
        onError: (err) => {
          setError(getAuthErrorMessage(err, 'Something went wrong. Please try again.'));
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

        <h2 className="text-3xl font-bold text-black mb-2">Forgot your password?</h2>
        <p className="text-black text-sm mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-white border border-black text-black font-bold rounded-xl text-sm">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold rounded-xl text-sm">{message}</div>
        )}

        {!message && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={forgotPasswordMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group"
            >
              <span>{forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}</span>
              {!forgotPasswordMutation.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-black">
          Remembered it?{' '}
          <button className="font-bold underline hover:text-gray-700" onClick={() => setView('Login')}>
            Back to login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
