import React, { useState } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import {
  ChevronDown, ChevronUp, PlayCircle, FileText, CheckCircle,
  CheckCircle2, ChevronRight, ChevronLeft, Bookmark, MessageSquare,
  X, BookOpen, Layers, PanelLeftClose, PanelLeftOpen, Award, Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useLesson } from '../api/hooks/useCourse';
import { useCourseProgress, useMarkLessonComplete } from '../api/hooks/useEnrollments';
import { useAppContext } from '../context/AppContext';

export default function CourseMaterial({ view, setView, lessonId, courseId }) {
  const [activeModule, setActiveModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showDrawer, setShowDrawer] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [note, setNote] = useState('');
  const [certGenerated, setCertGenerated] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const { user } = useAppContext();
  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: progress, isLoading: progressLoading } = useCourseProgress(courseId);
  const markComplete = useMarkLessonComplete(courseId);

  const modules = progress?.modules ?? [];
  const allLessons = modules.flatMap((m) => m.lessons ?? []);
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isCompleted = !progressLoading && allLessons.find((l) => l.id === lessonId)?.completed === true;

  // Find which module the current lesson belongs to — auto-expand it
  React.useEffect(() => {
    if (modules.length > 0 && lessonId) {
      const modIdx = modules.findIndex((m) => (m.lessons ?? []).some((l) => l.id === lessonId));
      if (modIdx !== -1) setActiveModule(modIdx);
    }
  }, [lessonId, modules.length]);

  async function handleMarkComplete() {
    if (isCompleted || !lessonId) return;
    try {
      console.log('🎯 Marking lesson complete:', lessonId);
      const result = await markComplete.mutateAsync({ lessonId });
      console.log('📊 Mark complete result:', result);
      
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#f59e0b'] });
      
      // Check if course was completed and certificate was generated
      if (result?.courseCompleted && result?.certificate) {
        console.log('🎉 Course completed! Certificate generated:', result.certificate);
        setCertificateInfo(result.certificate);
        setShowCertModal(true);
        // Extra confetti for course completion
        setTimeout(() => {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#10b981', '#fbbf24', '#f59e0b'] });
        }, 500);
      } else {
        console.log('📚 Course not yet completed or no certificate data');
        console.log('courseCompleted:', result?.courseCompleted);
        console.log('certificate:', result?.certificate);
      }
    } catch (e) {
      console.error('❌ Mark complete error:', e);
    }
  }

  function addBookmark() {
    if (!note.trim()) return;
    setBookmarks((b) => [...b, { id: Date.now(), lessonId, lessonTitle: lesson?.title, note }]);
    setNote('');
    setActiveTab('My Notes');
  }

  const tabs = ['Overview', 'My Notes'];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans h-screen overflow-hidden">
      <TopNavPublic setView={setView} />

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Sidebar toggle button (always visible) ── */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="absolute top-4 left-4 z-30 bg-white border border-emerald-200 rounded-lg p-2 shadow-sm hover:bg-emerald-50 transition-colors"
          title={sidebarOpen ? 'Hide course content' : 'Show course content'}
        >
          {sidebarOpen
            ? <PanelLeftClose className="w-4 h-4 text-[#1e4c31]" />
            : <PanelLeftOpen className="w-4 h-4 text-[#1e4c31]" />
          }
        </button>

        {/* ── Left Sidebar: Course Structure ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-emerald-50 border-r border-emerald-200 flex flex-col h-full flex-shrink-0 z-10 overflow-hidden"
            >

          {/* Progress header */}
          <div className="p-4 border-b border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Course Progress</span>
              <span className="text-sm font-bold text-[#1e4c31]">{progress?.percentage ?? 0}%</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1e4c31] h-full rounded-full transition-all"
                style={{ width: `${progress?.percentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0} lessons completed
            </p>
          </div>

          {/* Module list */}
          <div className="flex-1 overflow-y-auto py-2">
            {progressLoading && (
              <div className="p-4 space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-8 bg-emerald-100 rounded animate-pulse" />)}
              </div>
            )}

            {!progressLoading && modules.length === 0 && (
              <div className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No course structure available.</p>
              </div>
            )}

            {modules.map((mod, modIdx) => (
              <div key={mod.id} className="mb-1">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-100 transition-colors text-left"
                  onClick={() => setActiveModule(activeModule === modIdx ? null : modIdx)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Layers className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-black text-sm truncate">{mod.title}</span>
                  </div>
                  {activeModule === modIdx
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                </button>

                {activeModule === modIdx && (
                  <div className="pb-1">
                    {(mod.lessons ?? []).map((l) => {
                      const isCurrent = l.id === lessonId;
                      return (
                        <button
                          key={l.id}
                          onClick={() => setView && window.dispatchEvent(new CustomEvent('selectLesson', { detail: l.id }))}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                            isCurrent
                              ? 'bg-[#1e4c31] text-white'
                              : 'text-gray-700 hover:bg-emerald-100'
                          }`}
                        >
                          {l.completed
                            ? <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-emerald-300' : 'text-emerald-500'}`} />
                            : <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isCurrent ? 'border-emerald-300' : 'border-emerald-300'}`} />
                          }
                          <span className={`truncate ${isCurrent ? 'font-semibold' : ''}`}>{l.title}</span>
                          {l.duration_mins > 0 && (
                            <span className={`text-xs ml-auto flex-shrink-0 ${isCurrent ? 'text-emerald-300' : 'text-gray-400'}`}>
                              {l.duration_mins}m
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Back to overview */}
          <div className="p-4 border-t border-emerald-200">
            <button
              onClick={() => setView('CourseOverview')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-emerald-300 text-[#1e4c31] rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" /> Course Overview
            </button>
          </div>
        </motion.div>
        )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col">
          <div className="p-8 pt-14 w-full max-w-4xl mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
              <button onClick={() => setView('CourseCatalog')} className="hover:text-black transition-colors">Catalog</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => setView('CourseOverview')} className="hover:text-black transition-colors">Course</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-black font-medium truncate max-w-xs">{lesson?.title ?? 'Lesson'}</span>
            </div>

            {/* ── Content area ── */}
            {lessonLoading ? (
              <div className="w-full aspect-video bg-emerald-100 rounded-2xl animate-pulse mb-6" />
            ) : lesson?.type === 'VIDEO' && lesson?.content_url ? (
              <div className="relative w-full aspect-video bg-emerald-950 rounded-2xl overflow-hidden shadow-xl mb-6">
                <iframe
                  src={lesson.content_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : lesson?.type === 'TEXT' ? (
              <div className="w-full min-h-[200px] bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#1e4c31]" />
                  <span className="font-bold text-[#1e4c31]">Text Lesson</span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {lesson?.description ?? 'No content available.'}
                </p>
                {lesson?.content_url && (
                  <a
                    href={lesson.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 bg-[#1e4c31] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-900"
                  >
                    <FileText className="w-4 h-4" /> Open Resource
                  </a>
                )}
              </div>
            ) : lesson?.type === 'QUIZ' ? (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-black mb-2">Quiz Lesson</h3>
                <p className="text-gray-600 mb-4">Complete this quiz to mark the lesson as done.</p>
              </div>
            ) : (
              <div className="w-full aspect-video bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-16 h-16 text-emerald-300" />
              </div>
            )}

            {/* Lesson title + actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${
                  lesson?.type === 'VIDEO' ? 'bg-blue-100 text-blue-700' :
                  lesson?.type === 'QUIZ' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {lesson?.type ?? '...'}
                </span>
                <h1 className="text-2xl font-bold text-black">
                  {lessonLoading ? 'Loading...' : lesson?.title ?? 'Lesson'}
                </h1>
                {lesson?.duration_mins > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{lesson.duration_mins} min</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-2 border border-emerald-300 text-black px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" /> Discussion
                </button>
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleted || markComplete.isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-[#1e4c31] text-white hover:bg-emerald-900 disabled:opacity-60'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isCompleted ? 'Completed' : markComplete.isPending ? 'Saving...' : 'Mark Complete'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-emerald-200 mb-6">
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium relative transition-colors ${
                      activeTab === tab ? 'text-[#1e4c31]' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e4c31] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="pb-8">
              {activeTab === 'Overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-lg font-bold text-black mb-3">About this lesson</h3>
                  {lessonLoading ? (
                    <div className="space-y-2">
                      {[1, 0.8, 0.6].map((w, i) => (
                        <div key={i} className={`h-4 bg-emerald-100 rounded animate-pulse`} style={{ width: `${w * 100}%` }} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
                      {lesson?.description ?? 'No description available for this lesson.'}
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'My Notes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <label className="text-sm font-bold text-black">Add a note for this lesson</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Write your note here..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    <button
                      onClick={addBookmark}
                      disabled={!note.trim()}
                      className="flex items-center gap-2 bg-[#1e4c31] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-900 disabled:opacity-40"
                    >
                      <Bookmark className="w-4 h-4" /> Save Note
                    </button>
                  </div>

                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No notes yet for this session.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.filter((b) => b.lessonId === lessonId).map((bm) => (
                        <div key={bm.id} className="bg-white border border-emerald-200 rounded-xl p-4">
                          <p className="text-xs text-emerald-600 font-semibold mb-1">{bm.lessonTitle}</p>
                          <p className="text-sm text-gray-700">{bm.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between border-t border-emerald-100 pt-6 mt-2">
              <button
                onClick={() => prevLesson && window.dispatchEvent(new CustomEvent('selectLesson', { detail: prevLesson.id }))}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{prevLesson?.title ?? 'Previous'}</span>
                <span className="sm:hidden">Previous</span>
              </button>

              <span className="text-xs text-gray-400">
                {currentIdx + 1} / {allLessons.length}
              </span>

              <button
                onClick={() => nextLesson && window.dispatchEvent(new CustomEvent('selectLesson', { detail: nextLesson.id }))}
                disabled={!nextLesson}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e4c31] text-white rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{nextLesson?.title ?? 'Next'}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Certificate Achievement Modal ── */}
        <AnimatePresence>
          {showCertModal && certificateInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCertModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-black mb-2">Congratulations! 🎉</h2>
                <p className="text-gray-600 mb-4">
                  You've completed the entire course and earned your certificate!
                </p>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-emerald-800 font-semibold">Certificate ID</p>
                  <p className="text-emerald-600 font-mono text-lg">{certificateInfo.certificate_uid}</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setView('Certificate');
                      setShowCertModal(false);
                    }}
                    className="flex-1 bg-[#1e4c31] text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    View Certificate
                  </button>
                  
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="px-4 py-3 border border-emerald-300 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Discussion Drawer ── */}
        <AnimatePresence>
          {showDrawer && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-emerald-200 shadow-2xl z-20 flex flex-col"
            >
              <div className="p-4 border-b border-emerald-200 flex items-center justify-between">
                <h3 className="font-bold text-black flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#1e4c31]" /> Discussion
                </h3>
                <button onClick={() => setShowDrawer(false)} className="p-1.5 hover:bg-emerald-100 rounded-full text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Discussion feature coming soon.</p>
                </div>
              </div>
              <div className="p-4 border-t border-emerald-200">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
