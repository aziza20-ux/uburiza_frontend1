import React from 'react';
import { BookOpen, LayoutDashboard, FileText, Settings, LogOut, Library, BarChart2, KeyRound, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLogout } from '../api/hooks/useAuthMutations';

const NAV_ITEM = (isActive) =>
  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-emerald-50 text-[#1e4c31] font-semibold'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
  }`;

const ICON_CLS = (isActive) =>
  `w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#1e4c31]' : 'text-gray-400'}`;

export default function Sidebar({ view, setView, sidebarOpen, setSidebarOpen }) {
  const { userRole, setUser, setUserRole } = useAppContext();
  const { handleLogout, isPending: isLoggingOut } = useLogout({ setView, setUser, setUserRole });
  const isAdmin = userRole === 'admin';

  const learnerItems = [
    { name: 'Overview',    icon: LayoutDashboard, id: 'Dashboard'  },
    { name: 'My Courses',  icon: BookOpen,         id: 'MyCourses'  },
    { name: 'Certificate', icon: FileText,          id: 'Certificate'},
  ];

  const adminItems = [
    { name: 'Analytics',    icon: BarChart2, id: 'Analytics'    },
    { name: 'Courses',      icon: BookOpen,  id: 'AdminForms'   },
    { name: 'Resources',    icon: Library,   id: 'ResourceUpload'},
    { name: 'Access Codes', icon: KeyRound,  id: 'AccessCodes'  },
  ];

  const items = isAdmin ? adminItems : learnerItems;

  function navigate(id) {
    setView(id);
    setSidebarOpen(false);
  }

  const navContent = (showLabels = false) => (
    <>
      <div className="p-2 flex-1">
        <nav className="space-y-0.5">
          {items.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={!showLabels ? item.name : undefined}
                className={NAV_ITEM(isActive)}
              >
                <item.icon className={ICON_CLS(isActive)} />
                {showLabels && <span>{item.name}</span>}
                {!showLabels && (
                  <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 overflow-hidden text-sm">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => navigate('Settings')}
          title={!showLabels ? 'Settings' : undefined}
          className={NAV_ITEM(view === 'Settings')}
        >
          <Settings className={ICON_CLS(view === 'Settings')} />
          {showLabels && <span>Settings</span>}
          {!showLabels && (
            <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 overflow-hidden text-sm">
              Settings
            </span>
          )}
        </button>

        <button
          onClick={() => { handleLogout(); setSidebarOpen(false); }}
          disabled={isLoggingOut}
          title={!showLabels ? 'Log Out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 disabled:opacity-50"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-gray-400" />
          {showLabels && <span>{isLoggingOut ? 'Logging out…' : 'Log Out'}</span>}
          {!showLabels && (
            <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 overflow-hidden text-sm">
              {isLoggingOut ? 'Logging out…' : 'Log Out'}
            </span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — icon-only, expands on hover */}
      <div className="hidden lg:flex group/sidebar w-14 hover:w-52 bg-white border-r border-gray-200 flex-col h-full overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out flex-shrink-0">
        {navContent(false)}
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-50 lg:hidden transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900 text-sm">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {navContent(true)}
        </div>
      </div>
    </>
  );
}
