import React, { useState } from 'react';
import { Activity, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useRegisterMutation } from '../api/hooks/useAuthMutations';
import { getAuthErrorMessage } from '../api/auth-session';
import { btnPrimary, inputWithIcon, label, alertError } from '../lib/tokens';

export default function Signup({ setView, setPendingEmail }) {
  const registerMutation = useRegisterMutation();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    registerMutation.mutate(
      { name: formData.name, username: formData.username, email: formData.email, password: formData.password },
      {
        onSuccess: () => { setPendingEmail(formData.email); setView('VerifyEmail'); },
        onError: (err) => setError(getAuthErrorMessage(err, 'Signup failed. Please try again.')),
      }
    );
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSignup(); };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1e4c31] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=60')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <button onClick={() => setView('LandingPage')} className="relative flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          Uburiza Learn
        </button>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
            Start your learning journey today.
          </h1>
          <p className="text-emerald-200 text-sm leading-relaxed">
            Get access to world-class courses tailored for the African tech ecosystem. Build skills, earn certificates, and connect with peers.
          </p>
        </div>
        <div className="relative bg-white/10 border border-white/20 rounded-xl p-5">
          <p className="text-white text-sm italic mb-3">
            "Uburiza Learn gave me the practical skills I needed to land my first role as a Frontend Developer in Kigali."
          </p>
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?img=32" alt="" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-white text-sm font-semibold">Jean-Claude N.</p>
              <p className="text-emerald-300 text-xs">Frontend Engineer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <button onClick={() => setView('LandingPage')} className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-[#1e4c31] font-bold">
          <div className="w-7 h-7 rounded-lg bg-[#1e4c31] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          Uburiza Learn
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h2>
            <p className="text-sm text-gray-500">Join our community and start learning today.</p>
          </div>

          {error && (
            <div className={`${alertError} mb-5`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className={label} htmlFor="name">Full name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputWithIcon} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="username">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe123" className={inputWithIcon} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputWithIcon} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputWithIcon} />
              </div>
            </div>

            <button onClick={handleSignup} disabled={registerMutation.isPending} className={`${btnPrimary} w-full mt-2`}>
              {registerMutation.isPending ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">Terms</a> and{' '}
              <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => setView('Login')} className="font-semibold text-[#1e4c31] hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
