import React, { useState, useRef, useEffect } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';
import { Search, Grid, List, ArrowRight, Clock, Users, CheckCircle2, MoreVertical, Edit2, Trash2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCourses, useDeleteCourse, useUpdateCourse } from '../api/hooks/useCourse';
import { useAppContext } from '../context/AppContext';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function CardMenu({ onEdit, onDelete, onPublish, onUnpublish, published }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-40 py-1">
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit?.(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-emerald-50">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          {!published ? (
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); onPublish?.(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50">
              <Globe className="w-3.5 h-3.5" /> Publish
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); onUnpublish?.(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
              <Globe className="w-3.5 h-3.5" /> Unpublish
            </button>
          )}
          <div className="my-1 border-t border-slate-100" />
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete?.(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function CourseCatalog({ setView, onEditCourse, onSelectCourse }) {
  const { userRole } = useAppContext();
  const isAdmin = userRole === 'admin';
  const deleteCourse = useDeleteCourse();
  const updateCourse = useUpdateCourse();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [confirm, setConfirm] = useState(null); // { courseId, action, label }

  const handleConfirm = () => {
    if (confirm.action === 'delete') deleteCourse.mutate(confirm.courseId);
    else if (confirm.action === 'publish') updateCourse.mutate({ id: confirm.courseId, published: true });
    else if (confirm.action === 'unpublish') updateCourse.mutate({ id: confirm.courseId, published: false });
    setConfirm(null);
  };

  const { data: courses = [], isLoading, isError } = useCourses({
    ...(selectedLevel && { level: selectedLevel }),
    ...(selectedCategory && { category: selectedCategory }),
  });

  const filteredCourses = (courses ?? []).filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />
      
      <main className="flex-1 w-full px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block border border-emerald-200 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4">
            {isLoading ? '...' : `${courses.length} ACTIVE COURSES`}
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">
            Discover Your Next <span className="text-emerald-600">Digital Skill</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-black max-w-2xl">
              Browse our selection of premium courses curated specifically for the African tech ecosystem.
            </p>
            <div className="flex items-center space-x-2 bg-emerald-50 p-1 rounded-lg border border-emerald-200">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-black'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
                <span>Grid View</span>
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-black'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-black mb-3">Search</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search keywords..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-black mb-3">Skill Level</h3>
              <div className="space-y-3">
                {LEVELS.map(level => (
                  <label key={level} className="flex items-center space-x-3 cursor-pointer group" onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}>
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                      selectedLevel === level ? 'bg-emerald-600 border-emerald-600' : 'border-emerald-300 group-hover:border-emerald-500'
                    }`}>
                      {selectedLevel === level && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                    <span className="text-sm text-black capitalize">{level.charAt(0) + level.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-black mb-3">Price Range</h3>
              <div className="space-y-3">
                {['Free Courses', 'Premium Courses', 'On Sale'].map(price => (
                  <label key={price} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-emerald-300 rounded flex items-center justify-center group-hover:border-emerald-500">
                    </div>
                    <span className="text-sm text-black">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-black mb-3">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['AI', 'Fintech', 'AgriTech', 'Cloud', 'Data Science', 'SaaS', 'Marketing'].map(topic => (
                  <span key={topic} className="px-3 py-1.5 border border-emerald-200 rounded-full text-xs text-black cursor-pointer hover:border-emerald-500 hover:text-gray-700">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Promo Box */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-100 rounded-full blur-xl opacity-50"></div>
              <h4 className="font-bold text-black mb-2">Get Unlimited Access</h4>
              <p className="text-xs text-black mb-4 line-clamp-2">Unlock all 200+ courses with a premium subscription.</p>
              <button 
                className="w-full bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-900 transition-colors"
                onClick={() => setView('CourseOverview')}
              >
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                  !selectedCategory ? 'bg-emerald-800 text-white' : 'bg-white border border-emerald-200 text-black hover:border-emerald-500'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>All Courses</span>
              </button>
              {['Agriculture', 'Technology', 'Business', 'Finance', 'Health'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-emerald-800 text-white' : 'bg-white border border-emerald-200 text-black hover:border-emerald-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-emerald-200 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                    <div className="h-48 bg-emerald-200 animate-pulse" />
                    <div className="p-5 flex-1 flex flex-col space-y-4">
                      <div className="w-24 h-4 bg-emerald-200 rounded animate-pulse" />
                      <div className="w-full h-6 bg-emerald-200 rounded animate-pulse" />
                      <div className="w-3/4 h-6 bg-emerald-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : isError ? (
                <p className="col-span-3 text-center text-red-500 py-12">Failed to load courses.</p>
              ) : filteredCourses.length === 0 ? (
                <p className="col-span-3 text-center text-gray-400 py-12">No courses found.</p>
              ) : (
                filteredCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="bg-white border border-emerald-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                    onClick={() => onSelectCourse ? onSelectCourse(course.id) : setView('CourseOverview')}
                  >
                    <div className="relative h-48 overflow-hidden bg-emerald-100">
                      {course.thumbnail_url
                        ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full bg-emerald-200 flex items-center justify-center text-emerald-600 text-sm font-medium">No Image</div>
                      }
                      <div className="absolute top-3 left-3 flex space-x-2">
                        {course.level && (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-900/80 text-white">{course.level}</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          course.price ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {course.price ? `$${course.price}` : 'Free'}
                        </span>
                        {isAdmin && !course.published && (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-yellow-400 text-yellow-900">Draft</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="absolute top-3 right-3">
                          <CardMenu
                            published={course.published}
                            onEdit={() => onEditCourse(course.id)}
                            onPublish={() => setConfirm({ courseId: course.id, action: 'publish', label: 'Publish Course' })}
                            onUnpublish={() => setConfirm({ courseId: course.id, action: 'unpublish', label: 'Unpublish Course' })}
                            onDelete={() => setConfirm({ courseId: course.id, action: 'delete', label: 'Delete Course' })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      {course.category && (
                        <div className="text-xs font-bold text-emerald-600 tracking-wider mb-2 uppercase">{course.category}</div>
                      )}
                      <h3 className="text-lg font-bold text-black mb-4 line-clamp-2">{course.title}</h3>

                      <div className="mt-auto pt-4 border-t border-emerald-100 flex items-center justify-between text-sm text-black">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course._count?.enrollments ?? 0} enrolled</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course._count?.modules ?? 0} modules</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <button className="text-emerald-600 font-semibold flex items-center space-x-1 group-hover:text-emerald-700">
                          <span>Preview</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="mt-12 text-center border-t border-emerald-100 pt-12">
              <p className="text-sm text-black mb-4">Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
              <div className="flex justify-center items-center space-x-3">
                <button className="border border-emerald-300 text-black px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                  <span>Show More Courses</span>
                </button>
                <button className="bg-emerald-800 text-white p-3 rounded-lg hover:bg-emerald-900 transition-colors">
                  <ArrowRight className="w-5 h-5 -rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 bg-emerald-50 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between border border-emerald-100 relative overflow-hidden">
          <div className="relative z-10 mb-8 md:mb-0 max-w-xl">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">Join 50k+ African Learners</h2>
            <p className="text-black mb-6">Empower yourself with world-class education designed for the future of work in Africa.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-emerald-200 text-sm font-medium text-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Certificates</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-emerald-200 text-sm font-medium text-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center">
            <div className="flex -space-x-4">
              {[1,2,3,4,5].map(i => (
                <img key={i} src={`https://i.pravatar.cc/150?img=${i+40}`} alt="Student" className="w-14 h-14 rounded-full border-4 border-emerald-50 object-cover" />
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-emerald-50 bg-emerald-500 flex items-center justify-center text-white text-xs font-bold z-10">
                +50k
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        </div>
      </main>

      <Footer />

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-black mb-2">{confirm.label}</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to <span className="font-semibold text-black">{confirm.label.toLowerCase()}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm font-medium border border-emerald-200 rounded-lg hover:bg-emerald-50 text-black">Cancel</button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${
                  confirm.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  confirm.action === 'unpublish' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-[#1e4c31] hover:bg-emerald-900'
                }`}
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
