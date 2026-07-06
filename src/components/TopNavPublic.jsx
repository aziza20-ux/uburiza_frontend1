import React, { useState } from 'react';
import { Activity, Search, Bell, Flame, ChevronDown, LayoutDashboard, Settings, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLogout } from '../api/hooks/useAuthMutations';

export default function TopNavPublic({ setView }) {
  const { streak, user, userRole, setUser, setUserRole } = useAppContext();
  const { handleLogout, isPending: isLoggingOut } = useLogout({ setView, setUser, setUserRole });
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = userRole === 'admin';
  const isLoggedIn = !!user;

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setView('LandingPage')}
          className="flex items-center gap-2 text-[#1e4c31] font-bold text-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-[#1e4c31] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span>Uburiza Learn</span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setView('CourseCatalog')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Courses</button>
          <button onClick={() => setView('Resources')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Resources</button>
          {isLoggedIn && !isAdmin && (
            <button onClick={() => setView('Dashboard')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">My Dashboard</button>
          )}
          {isAdmin && (
            <button onClick={() => setView('Analytics')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          )}
        </nav>
      </div>

      {/* Right */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search…"
            className="pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e4c31] focus:bg-white w-52 transition duration-150"
          />
        </div>

        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-1 text-gray-700 text-sm font-semibold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>{streak}</span>
            </div>
            <button className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1e4c31] rounded-full" />
            </button>
            <div className="relative" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
              <button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-7 h-7 rounded-full border border-gray-200 object-cover" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email ?? (isAdmin ? 'Administrator' : 'Learner')}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { setView(isAdmin ? 'Analytics' : 'Dashboard'); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                    </button>
                    <button onClick={() => { setView('Settings'); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button onClick={() => { handleLogout(); setProfileOpen(false); }} disabled={isLoggingOut} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      <LogOut className="w-4 h-4" /> {isLoggingOut ? 'Logging out…' : 'Log Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <button onClick={() => setView('Login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Log in
            </button>
            <button onClick={() => setView('Signup')} className="text-sm font-semibold bg-[#1e4c31] text-white px-4 py-2 rounded-lg hover:bg-[#163824] transition-colors">
              Join Free
            </button>
          </div>
        )}
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-lg flex flex-col gap-1 md:hidden z-50">
          <button onClick={() => { setView('CourseCatalog'); setMobileOpen(false); }} className="text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">Courses</button>
          <button onClick={() => { setView('Resources'); setMobileOpen(false); }} className="text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">Resources</button>
          {isLoggedIn && !isAdmin && (
            <button onClick={() => { setView('Dashboard'); setMobileOpen(false); }} className="text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">My Dashboard</button>
          )}
          {isAdmin && (
            <button onClick={() => { setView('Analytics'); setMobileOpen(false); }} className="text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Admin Dashboard
            </button>
          )}
          {!isLoggedIn && (
            <>
              <button onClick={() => { setView('Login'); setMobileOpen(false); }} className="text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">Log in</button>
              <button onClick={() => { setView('Signup'); setMobileOpen(false); }} className="text-left text-sm font-semibold bg-[#1e4c31] text-white py-2.5 px-3 rounded-lg">Join Free</button>
            </>
          )}
          {isLoggedIn && (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} disabled={isLoggingOut} className="text-left text-sm font-medium text-red-600 py-2.5 px-3 rounded-lg hover:bg-red-50 disabled:opacity-50">
              {isLoggingOut ? 'Logging out…' : 'Log Out'}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
