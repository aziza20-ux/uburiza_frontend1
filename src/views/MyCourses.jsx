import React from 'react';
import { BookOpen, ChevronRight, PlayCircle, Award } from 'lucide-react';
import { useMyEnrollments } from '../api/hooks/useEnrollments';
import { useUserCertificates } from '../api/hooks/useCertificates';
import { useAppContext } from '../context/AppContext';
import { btnPrimary, btnSecondary, card, badgeGreen, badgeAmber } from '../lib/tokens';

export default function MyCourses({ setView, onSelectCourse }) {
  const { user } = useAppContext();
  const { data: enrollments = [], isLoading, isError } = useMyEnrollments();
  const { data: certificates = [] } = useUserCertificates(user?.id);

  const certificateMap = React.useMemo(() => {
    const map = new Map();
    certificates.forEach((cert) => map.set(cert.course.id, cert));
    return map;
  }, [certificates]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Courses</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, <span className="font-medium text-gray-700">{user?.name || user?.username || 'Learner'}</span>
        </p>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3">
          {[
            { icon: BookOpen,   label: 'Enrolled',    value: enrollments.length },
            { icon: PlayCircle, label: 'In Progress',  value: enrollments.filter((e) => !e.completed_at).length },
            { icon: Award,      label: 'Certificates', value: certificates.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={`${card} flex items-center gap-3 px-4 py-3`}>
              <Icon className="w-4 h-4 text-[#1e4c31]" />
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-base font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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

      {isError && <p className="text-sm text-red-600">Failed to load your courses. Please try again.</p>}

      {/* Empty */}
      {!isLoading && !isError && enrollments.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 flex flex-col items-center text-center">
          <BookOpen className="w-10 h-10 text-gray-200 mb-4" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No courses yet</p>
          <p className="text-xs text-gray-400 mb-5">Browse the catalog and enroll to get started.</p>
          <button onClick={() => setView('CourseCatalog')} className={btnPrimary}>
            Browse Courses
          </button>
        </div>
      )}

      {/* Course grid */}
      {!isLoading && enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const hasCert = certificateMap.has(course?.id);
            return (
              <div
                key={enrollment.id}
                onClick={() => onSelectCourse ? onSelectCourse(course?.id) : setView('CourseOverview')}
                className={`${card} overflow-hidden hover:shadow-md transition-shadow cursor-pointer group`}
              >
                <div className="h-36 bg-gray-100 overflow-hidden relative">
                  {course?.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-300" /></div>
                  }
                  {hasCert && (
                    <span
                      className={`${badgeAmber} absolute top-2 left-2 cursor-pointer`}
                      onClick={(e) => { e.stopPropagation(); setView('Certificate'); }}
                    >
                      <Award className="w-3 h-3" /> Certified
                    </span>
                  )}
                  {enrollment.completed_at && (
                    <span className={`${badgeGreen} absolute top-2 right-2`}>Completed</span>
                  )}
                </div>

                <div className="p-4">
                  {course?.category && (
                    <p className="text-xs font-medium text-[#1e4c31] uppercase tracking-wide mb-1">{course.category}</p>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{course?.title ?? 'Untitled Course'}</h3>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {course?.level && <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600">{course.level}</span>}
                    <span>{course?._count?.modules ?? 0} modules</span>
                  </div>

                  {enrollment.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold text-gray-700">{enrollment.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#1e4c31] h-1.5 rounded-full transition-all" style={{ width: `${enrollment.progress.percentage}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                    {hasCert ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); setView('Certificate'); }}
                        className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:text-amber-700"
                      >
                        <Award className="w-3 h-3" /> View Certificate
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#1e4c31] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Continue <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
