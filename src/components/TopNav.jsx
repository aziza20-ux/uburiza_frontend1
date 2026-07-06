import React, { useState } from 'react';
import { Bell, Search, Activity, Flame, Menu, X, ChevronDown, LayoutDashboard, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLogout } from '../api/hooks/useAuthMutations';
import { useMyProfile } from '../api/hooks/useProfile';

export default function TopNav({ view, setView, sidebarOpen, setSidebarOpen }) {
  const { streak, user, userRole, setUser, setUserRole } = useAppContext();
  const { handleLogout, isPending: isLoggingOut } = useLogout({ setView, setUser, setUserRole });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: profile } = useMyProfile();

  const isAdmin = userRole === 'admin';
  const avatarSrc = profile?.picture_url ?? `https://i.pravatar.cc/150?img=11`;
  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (user?.name ?? 'User');

  const navLinkCls = (active) =>
    `text-sm font-medium transition-colors duration-150 ${
      active ? 'text-[#1e4c31] font-semibold' : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setView(isAdmin ? 'Analytics' : 'Dashboard')}
          className="flex items-center gap-2 text-[#1e4c31] font-bold text-lg"
        >
          <div className="w-7 h-7 rounded-lg bg-[#1e4c31] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span>Uburiza Learn</span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setView('CourseCatalog')} className={navLinkCls(view === 'CourseCatalog')}>
            Courses
          </button>
          <button onClick={() => setView('Resources')} className={navLinkCls(view === 'Resources')}>
            Resources
          </button>
          {!isAdmin && (
            <button onClick={() => setView('Dashboard')} className={navLinkCls(view === 'Dashboard')}>
              My Dashboard
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setView('Analytics')} className={`${navLinkCls(view === 'Analytics')} flex items-center gap-1`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
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
            className="pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e4c31] focus:bg-white w-52 transition duration-150"
          />
        </div>

        <div className="flex items-center gap-1 text-gray-700 text-sm font-semibold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg" title={`${streak}-day streak`}>
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>{streak}</span>
        </div>

        <button className="relative text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1e4c31] rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <img src={avatarSrc} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email ?? (isAdmin ? 'Administrator' : 'Learner')}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setView(isAdmin ? 'Analytics' : 'Dashboard'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />
                  Dashboard
                </button>
                <button
                  onClick={() => { setView('Settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => { handleLogout(); setDropdownOpen(false); }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? 'Logging out…' : 'Log Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </header>
  );
}
