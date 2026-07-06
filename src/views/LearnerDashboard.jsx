import React from 'react';
import { Play, TrendingUp, BookOpen, ChevronRight, Clock, Award, PlayCircle, Layers, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useMyEnrollments } from '../api/hooks/useEnrollments';
import { btnPrimary, btnSecondary, card } from '../lib/tokens';

export default function LearnerDashboard({ setView, onSelectCourse }) {
  const { user, streak } = useAppContext();
  const { data: enrollments = [], isLoading } = useMyEnrollments();

  const inProgress = enrollments.filter((e) => !e.completed_at);
  const completed  = enrollments.filter((e) => e.completed_at);
  const totalLessons     = enrollments.reduce((s, e) => s + (e.progress?.totalLessons ?? 0), 0);
  const completedLessons = enrollments.reduce((s, e) => s + (e.progress?.completedLessons ?? 0), 0);
  const overallProgress  = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const activityData = React.useMemo(() =>
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => ({ day, lessons: 0 })), []);

  const resumeCourse = inProgress[0];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name || user?.username || 'there'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {overallProgress > 0
              ? `You've completed ${overallProgress}% of your enrolled courses.`
              : 'Start learning — browse courses and enroll to track your progress.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resumeCourse ? (
            <button
              onClick={() => onSelectCourse ? onSelectCourse(resumeCourse.course?.id) : setView('MyCourses')}
              className={btnPrimary}
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Resume Course
            </button>
          ) : (
            <button onClick={() => setView('CourseCatalog')} className={btnPrimary}>
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </button>
          )}
          <button onClick={() => setView('MyCourses')} className={btnSecondary}>
            My Courses
          </button>
        </div>
      </div>

      {/* ── Stat pills ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp,    label: 'Day Streak',        value: streak ?? 0 },
          { icon: CheckCircle2,  label: 'Lessons Done',      value: completedLessons },
          { icon: BookOpen,      label: 'Enrolled',          value: enrollments.length },
          { icon: Award,         label: 'Completed',         value: completed.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className={`${card} p-4 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#1e4c31]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* In Progress */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#1e4c31]" /> In Progress
              </h2>
              <button onClick={() => setView('MyCourses')} className="text-sm font-medium text-[#1e4c31] hover:underline">
                View all
              </button>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className={`${card} overflow-hidden animate-pulse`}>
                    <div className="h-36 bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && inProgress.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 mb-1">No courses in progress</p>
                <p className="text-xs text-gray-400 mb-4">Enroll in a course to start learning.</p>
                <button onClick={() => setView('CourseCatalog')} className={btnPrimary}>
                  Browse Courses
                </button>
              </div>
            )}

            {!isLoading && inProgress.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgress.slice(0, 4).map((enrollment) => {
                  const course = enrollment.course;
                  const pct = enrollment.progress?.percentage ?? 0;
                  return (
                    <div
                      key={enrollment.id}
                      onClick={() => onSelectCourse ? onSelectCourse(course?.id) : setView('MyCourses')}
                      className={`${card} overflow-hidden hover:shadow-md transition-shadow cursor-pointer group`}
                    >
                      <div className="relative h-36 bg-gray-100">
                        {course?.thumbnail_url
                          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-300" /></div>
                        }
                        <span className="absolute top-2 left-2 bg-white/90 text-xs font-medium px-2 py-0.5 rounded text-gray-700">
                          {course?._count?.modules ?? 0} modules
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{course?.title ?? 'Untitled'}</h3>
                        {course?.category && (
                          <p className="text-xs text-[#1e4c31] font-medium uppercase tracking-wide mb-3">{course.category}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-gray-700">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                          <div className="bg-[#1e4c31] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-xs font-medium text-[#1e4c31] group-hover:text-[#163824]">
                          <span>Continue Learning</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Activity chart */}
          <section className={`${card} p-5`}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Learning Activity</h2>
                <p className="text-xs text-gray-500 mt-0.5">Lessons completed this week</p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                {completedLessons} total
              </span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e4c31" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#1e4c31" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-8} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 16px -2px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="lessons" stroke="#1e4c31" strokeWidth={2} fillOpacity={1} fill="url(#colorLessons)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress summary */}
          <div className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-[#1e4c31]" /> My Progress
            </h2>
            {[
              { label: 'Enrolled',          value: enrollments.length },
              { label: 'In Progress',       value: inProgress.length },
              { label: 'Completed',         value: completed.length },
              { label: 'Lessons Completed', value: completedLessons },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
            {totalLessons > 0 && (
              <div className="pt-3 mt-1 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Overall</span>
                  <span className="font-semibold text-gray-700">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#1e4c31] h-1.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#1e4c31]" /> Achievements
            </h2>
            {completed.length > 0 ? (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-0.5">Latest completion</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{completed[0].course?.title}</p>
                </div>
                <button
                  onClick={() => setView('Certificate')}
                  className={`${btnSecondary} w-full`}
                >
                  View Certificates
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <Award className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Complete a course to earn your first certificate.</p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#1e4c31]" /> Quick Actions
            </h2>
            <div className="space-y-0.5">
              {[
                { label: 'Browse Courses', view: 'CourseCatalog' },
                { label: 'My Courses',     view: 'MyCourses'     },
                { label: 'Certificates',   view: 'Certificate'   },
                { label: 'Settings',       view: 'Settings'      },
              ].map(({ label, view: v }) => (
                <button
                  key={label}
                  onClick={() => setView(v)}
                  className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
