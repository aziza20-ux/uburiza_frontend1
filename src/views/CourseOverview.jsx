import React, { useState } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';
import {
  Clock, Users, Play, CheckCircle2, ChevronDown, ChevronUp,
  PlayCircle, FileText, Award, Heart, Share2, ShieldCheck,
  BookOpen, Layers,
} from 'lucide-react';
import { useEnrollCourse, useMyEnrollments, useRedeemAccessCode } from '../api/hooks/useEnrollments';
import { useCourse } from '../api/hooks/useCourse';
import { useAppContext } from '../context/AppContext';

export default function CourseOverview({ view, setView, onSelectLesson, courseId, onPayCourse }) {
  const [activeModule, setActiveModule] = useState(0);

  const { user } = useAppContext();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: enrollments = [] } = useMyEnrollments();
  const enrollCourse = useEnrollCourse();
  const redeemCode = useRedeemAccessCode();

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const modules = course?.modules ?? [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  const totalDuration = modules.reduce((sum, m) =>
    sum + (m.lessons ?? []).reduce((s, l) => s + (l.duration_mins ?? 0), 0), 0
  );

  const isEnrolled = enrollments.some((e) => e.course?.id === courseId || e.course_id === courseId);
  const isPaid = course && course.price != null && Number(course.price) > 0;

  async function handleRedeemCode() {
    if (!user) return setView('Login');
    if (!accessCode.trim()) return setCodeError('Please enter an access code.');
    setCodeError('');
    try {
      await redeemCode.mutateAsync({ code: accessCode.trim() });
      setView('CourseMaterial');
    } catch (err) {
      setCodeError(err?.error ?? 'Invalid or expired access code.');
    }
  }

  async function handleEnroll() {
    if (!user) return setView('Login');
    if (isEnrolled) return setView('CourseMaterial');
    if (isPaid) return onPayCourse ? onPayCourse(course) : null;
    try {
      await enrollCourse.mutateAsync({ courseId });
      setView('CourseMaterial');
    } catch (err) {
      if (err?.error?.includes('Already enrolled')) setView('CourseMaterial');
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans">
        <TopNavPublic setView={setView} />
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl px-8 animate-pulse">
            <div className="h-8 bg-emerald-100 rounded w-3/4" />
            <div className="h-4 bg-emerald-100 rounded w-1/2" />
            <div className="h-4 bg-emerald-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans">
        <TopNavPublic setView={setView} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-emerald-50 border-b border-emerald-100 py-16 px-8 md:px-16">
          <div className="w-full flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {course.category && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="bg-white border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-lg text-gray-600 max-w-2xl">{course.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-black font-medium">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course._count?.enrollments ?? 0} Learners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  <span>{modules.length} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>{totalLessons} Lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{Math.round(totalDuration / 60)}h {totalDuration % 60}m total</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-full lg:w-5/12 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white aspect-video bg-emerald-100">
                {course.thumbnail_url ? (
                  <>
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-950/30 flex items-center justify-center">
                      <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 ml-1" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-emerald-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="py-16 px-8 md:px-16 w-full flex flex-col lg:flex-row gap-12">
          {/* Main column */}
          <div className="flex-1 space-y-16">

            {/* Description */}
            {course.description && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4">About this Course</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
              </div>
            )}

            {/* Curriculum */}
            {modules.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-6 h-6 text-black" />
                    <h2 className="text-2xl font-bold text-black">Course Curriculum</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-bold text-black">{modules.length} Modules</span>
                    {' • '}{totalLessons} lessons
                    {totalDuration > 0 && ` • ${Math.round(totalDuration / 60)}h ${totalDuration % 60}m`}
                  </div>
                </div>

                <div className="space-y-3">
                  {modules.map((mod, idx) => (
                    <div key={mod.id} className="border border-emerald-200 rounded-xl overflow-hidden">
                      <button
                        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${activeModule === idx ? 'bg-emerald-50' : 'bg-white hover:bg-emerald-50'}`}
                        onClick={() => setActiveModule(activeModule === idx ? null : idx)}
                      >
                        <div>
                          <h4 className="font-bold text-black">{mod.title}</h4>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {mod.lessons?.length ?? 0} lessons
                            {mod.description && ` • ${mod.description}`}
                          </div>
                        </div>
                        {activeModule === idx
                          ? <ChevronUp className="w-5 h-5 text-black flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-black flex-shrink-0" />
                        }
                      </button>

                      {activeModule === idx && (mod.lessons ?? []).length > 0 && (
                        <div className="border-t border-emerald-100 bg-white divide-y divide-slate-50">
                          {(mod.lessons ?? []).map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-5 py-3 hover:bg-emerald-50 cursor-pointer transition-colors"
                              onClick={() => isEnrolled && onSelectLesson ? onSelectLesson(lesson.id) : handleEnroll()}
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'VIDEO'
                                  ? <PlayCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  : lesson.type === 'QUIZ'
                                  ? <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                  : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                }
                                <span className="text-sm text-black">{lesson.title}</span>
                                {!isEnrolled && (
                                  <span className="text-xs text-gray-400 ml-1">🔒</span>
                                )}
                              </div>
                              {lesson.duration_mins > 0 && (
                                <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                                  {lesson.duration_mins} min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Modules', value: modules.length, icon: Layers },
                { label: 'Lessons', value: totalLessons, icon: PlayCircle },
                { label: 'Enrolled', value: course._count?.enrollments ?? 0, icon: Users },
                { label: 'Duration', value: `${Math.round(totalDuration / 60)}h ${totalDuration % 60}m`, icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#1e4c31]" />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-black">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sticky Pricing Card ── */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-emerald-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 pb-6">
                  {/* Price */}
                  <div className="mb-6">
                    {isPaid ? (
                      <span className="text-4xl font-black text-black">
                        {Number(course.price).toLocaleString()} RWF
                      </span>
                    ) : (
                      <span className="text-3xl font-black text-emerald-600">Free</span>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={enrollCourse.isPending}
                    className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-900 transition-colors mb-3 shadow-lg shadow-emerald-200 disabled:opacity-60"
                  >
                    {enrollCourse.isPending
                      ? 'Enrolling...'
                      : isEnrolled
                      ? 'Continue Learning →'
                      : isPaid
                      ? 'Buy & Enroll'
                      : 'Enroll for Free'}
                  </button>
                  <p className="text-center text-xs text-slate-500 mb-6">Create a free account to track your progress.</p>

                  {/* Access code option for paid courses */}
                  {isPaid && !isEnrolled && (
                    <div className="mt-2">
                      {!showCodeInput ? (
                        <button
                          onClick={() => setShowCodeInput(true)}
                          className="w-full text-sm text-[#1e4c31] font-semibold py-2 hover:underline"
                        >
                          Have an access code?
                        </button>
                      ) : (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={accessCode}
                              onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setCodeError(''); }}
                              placeholder="e.g. UBZ-ABC123"
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              onClick={handleRedeemCode}
                              disabled={redeemCode.isPending}
                              className="bg-[#1e4c31] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-900 disabled:opacity-60 whitespace-nowrap"
                            >
                              {redeemCode.isPending ? '...' : 'Apply'}
                            </button>
                          </div>
                          {codeError && <p className="text-xs text-red-500">{codeError}</p>}
                          <button
                            onClick={() => { setShowCodeInput(false); setAccessCode(''); setCodeError(''); }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mt-6">
                    <p className="text-sm font-bold text-black">This course includes:</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-black">
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                        <span>{totalLessons} on-demand lessons</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-black">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>{modules.length} structured modules</span>
                      </li>
                      {totalDuration > 0 && (
                        <li className="flex items-center gap-3 text-sm text-black">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{Math.round(totalDuration / 60)}h {totalDuration % 60}m of content</span>
                        </li>
                      )}
                      <li className="flex items-center gap-3 text-sm text-black">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 border-t border-emerald-100 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="text-gray-500 hover:text-emerald-700 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {course._count?.enrollments ?? 0} enrolled
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-[#1e4c31] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-black mb-1">30-Day Money-Back</h4>
                  <p className="text-xs text-gray-500">Full refund if not satisfied.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
