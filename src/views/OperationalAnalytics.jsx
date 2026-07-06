import React, { useState, useRef, useEffect } from 'react';
import { Filter, Users, BookOpen, TrendingUp, FileText, Plus, Upload, MoreVertical, Search } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { useAdminStats, useAdminLearners } from '../api/hooks/useEnrollments';
import { btnPrimary, btnSecondary, btnDanger, card, badgeGreen, badgeGray, badgeAmber } from '../lib/tokens';

const PAGE_SIZE = 10;

const statusBadge = (status) => {
  if (status === 'active')    return badgeGreen;
  if (status === 'completed') return badgeAmber;
  return badgeGray;
};

export default function OperationalAnalytics({ setView }) {
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [confirm, setConfirm]   = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: learnersRaw = [], isLoading: learnersLoading } = useAdminLearners();

  const chartData = stats?.monthly_chart ?? [];

  const rows = learnersRaw.flatMap((learner) =>
    learner.enrollments?.length
      ? learner.enrollments.map((enr) => ({
          id: `${learner.id}-${enr.course?.title}`,
          user_name: learner.name,
          course_title: enr.course?.title ?? '—',
          enrolled_at: enr.enrolled_at,
          status: enr.completed_at ? 'completed' : 'active',
        }))
      : [{ id: learner.id, user_name: learner.name, course_title: '—', enrolled_at: learner.created_at, status: 'inactive' }]
  );

  const filtered   = rows.filter((e) =>
    e.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.course_title?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const metrics = [
    { icon: Users,     label: 'Total Learners',    value: stats?.totalUsers ?? '—' },
    { icon: BookOpen,  label: 'Total Courses',      value: stats?.totalCourses ?? '—' },
    { icon: TrendingUp,label: 'Platform Revenue',   value: stats?.revenue?.total != null ? `${Number(stats.revenue.total).toLocaleString()} RWF` : '—' },
    { icon: FileText,  label: 'Completed Courses',  value: stats?.completedCourses ?? '—' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Operational Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor platform growth and learner engagement.</p>
        </div>
        <button className={btnSecondary}>
          <Filter className="w-4 h-4" /> Filter Dates
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className={`${card} p-5`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-[#1e4c31]" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? <span className="text-gray-200 animate-pulse">···</span> : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className={`${card} p-5 lg:col-span-2`}>
          <h2 className="text-base font-semibold text-gray-900 mb-0.5">Enrollment & Completions</h2>
          <p className="text-xs text-gray-500 mb-5">6-month enrollment vs. completion trend</p>
          <div className="h-64 w-full">
            {chartData.length === 0 && !statsLoading ? (
              <p className="text-sm text-gray-400 text-center pt-20">No chart data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLearners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e4c31" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#1e4c31" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-8} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="learners"    stroke="#1e4c31" strokeWidth={2} fillOpacity={1} fill="url(#colorLearners)" />
                  <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e4c31]" /> Learners
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Completions
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => setView('AdminForms')} className={`${btnPrimary} w-full`}>
              <Plus className="w-4 h-4" /> Launch New Course
            </button>
            <button onClick={() => setView('ResourceUpload')} className={`${btnSecondary} w-full`}>
              <Upload className="w-4 h-4" /> Resource Builder
            </button>
          </div>
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Health</h4>
            <div className="space-y-3">
              {[
                { label: 'Server Load', value: 'Normal (12%)' },
                { label: 'API Latency', value: '42ms' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learner table */}
      <div className={`${card} p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Learner Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review enrollment status across all courses.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search learners…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e4c31] focus:bg-white w-56 transition duration-150"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Student', 'Enrolled Course', 'Date', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statsLoading || learnersLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Loading…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No learners found.</td></tr>
              ) : paginated.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-semibold text-[#1e4c31]">
                        {e.user_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{e.user_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{e.course_title}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={statusBadge(e.status)}>
                      {e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="relative inline-block" ref={openMenu === e.id ? menuRef : null}>
                      <button onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === e.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                          <button onClick={() => { setOpenMenu(null); setConfirm({ id: e.id, action: 'suspend', label: 'Suspend Learner' }); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Suspend Learner</button>
                          <button onClick={() => { setOpenMenu(null); setConfirm({ id: e.id, action: 'unenroll', label: 'Unenroll Learner' }); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Unenroll Learner</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {paginated.length} of {filtered.length}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{confirm.label}</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to <span className="font-medium text-gray-700">{confirm.label.toLowerCase()}</span>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className={btnSecondary}>Cancel</button>
              <button
                onClick={() => setConfirm(null)}
                className={confirm.action === 'unenroll' ? btnDanger : btnPrimary}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
