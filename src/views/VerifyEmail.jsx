import React, { useState } from 'react';
import { Activity, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../api/hooks/useAuthMutations';
import { getAuthErrorMessage, persistSession } from '../api/auth-session';
import { useAppContext } from '../context/AppContext';

export default function VerifyEmail({ setView, email }) {
  const { setUser, setUserRole } = useAppContext();
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = () => {
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    setError('');
    verifyMutation.mutate(
      { email, otp },
      {
        onSuccess: (data) => {
          setView(persistSession(data, { setUser, setUserRole }));
        },
        onError: (err) => {
          setError(getAuthErrorMessage(err, 'Invalid or expired code'));
        },
      }
    );
  };

  const handleResend = () => {
    setError('');
    setMessage('');
    resendMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setMessage(data.message);
        },
        onError: (err) => {
          setError(getAuthErrorMessage(err, 'Failed to resend code'));
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
        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xl mb-10 cursor-pointer w-fit" onClick={() => setView('LandingPage')}>
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span>Uburiza Learn</span>
        </div>

        <h2 className="text-3xl font-bold text-black mb-2">Check your email</h2>
        <p className="text-black text-sm mb-8">
          We sent a 6-digit verification code to <span className="font-bold">{email}</span>
        </p>

        {error && <div className="mb-4 p-3 bg-white border border-black text-black font-bold rounded-xl text-sm">{error}</div>}
        {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold rounded-xl text-sm">{message}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
              placeholder="123456"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-black text-center text-xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group"
          >
            <span>{verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}</span>
            {!verifyMutation.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <button
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="w-full flex items-center justify-center space-x-2 text-sm text-black hover:text-emerald-700 font-medium py-2 disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{resendMutation.isPending ? 'Sending...' : 'Resend code'}</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-black">
          Wrong email?{' '}
          <button className="font-bold underline hover:text-gray-700" onClick={() => setView('Signup')}>
            Go back
          </button>
        </p>
      </motion.div>
    </div>
  );
}
