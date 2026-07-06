import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';
import { Play, TrendingUp, Code, Lightbulb, TrendingUp as Marketing, MonitorSmartphone, ArrowRight, CheckCircle2, Users, BookOpen } from 'lucide-react';
import { getPublicStats, getPublicCourses } from '../api/public_api';

const CATEGORY_ICONS = {
  Agriculture: Code,
  Technology: MonitorSmartphone,
  Business: Lightbulb,
  Finance: Marketing,
};

const CATEGORIES = ['All', 'Agriculture', 'Technology', 'Business', 'Finance'];

export default function LandingPage({ setView }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: stats } = useQuery({ queryKey: ['publicStats'], queryFn: getPublicStats, staleTime: 5 * 60 * 1000 });
  const { data: coursesData, isLoading: coursesLoading } = useQuery({ queryKey: ['publicCourses'], queryFn: () => getPublicCourses(3), staleTime: 5 * 60 * 1000 });
  const courses = coursesData?.courses ?? [];

  const { data: allCoursesData } = useQuery({ queryKey: ['publicCoursesAll'], queryFn: () => getPublicCourses(100), staleTime: 5 * 60 * 1000 });
  const allCourses = allCoursesData?.courses ?? [];
  const categoryCounts = allCourses.reduce((acc, c) => {
    if (c.category) acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, count]) => ({
      title: cat,
      courses: `${count} Course${count !== 1 ? 's' : ''}`,
      icon: CATEGORY_ICONS[cat] ?? BookOpen,
    }));

  const statItems = [
    { value: stats?.totalLearners != null ? `${stats.totalLearners.toLocaleString()}+` : '—', label: 'ACTIVE STUDENTS' },
    { value: stats?.totalCourses != null ? `${stats.totalCourses}+` : '—', label: 'DIGITAL COURSES' },
    { value: stats?.totalEnrollments != null ? `${stats.totalEnrollments.toLocaleString()}+` : '—', label: 'ENROLLMENTS' },
    { value: stats?.totalCertificates != null ? `${stats.totalCertificates.toLocaleString()}+` : '—', label: 'CERTIFICATES ISSUED' },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-8 md:px-16 py-16 md:py-24 w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-emerald-600 font-medium mb-6">
              <span className="w-8 h-[2px] bg-emerald-500"></span>
              <span>Empowering African Tech Leaders</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-emerald-900 leading-tight mb-6">
              Master Digital <br />
              Skills. <span className="text-emerald-500">Lead</span> <br />
              <span className="text-emerald-500">the Future.</span>
            </h1>
            <p className="text-black text-lg mb-10 max-w-md">
              Unlock your potential with premium, African-led digital education. From AI to Entrepreneurship, we build the leaders of tomorrow.
            </p>
            <div className="flex items-center space-x-4 mb-10">
              <button onClick={() => setView('CourseCatalog')} className="bg-[#1e4c31] text-white px-7 py-3 rounded-lg font-semibold hover:bg-[#163824] transition-colors text-sm">
                Explore Courses
              </button>
              <button className="flex items-center space-x-2 text-[#1e4c31] font-semibold px-5 py-3 rounded-lg border border-emerald-300 hover:bg-emerald-50 transition-colors text-sm">
                <Play className="w-4 h-4" />
                <span>How it works</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Student" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="text-sm text-black">
                <span className="font-bold text-black">
                  {stats?.totalLearners ? `${stats.totalLearners.toLocaleString()}+` : 'Join'}
                </span>{' '}ambitious learners
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Students learning" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-black">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-black font-medium uppercase tracking-wider">Salary Growth</p>
                <p className="text-xl font-bold text-black">+85% Avg. Increase</p>
              </div>
            </div>
          </div>
        </section>

        {/* Logos */}
        <section className="border-t border-b border-emerald-100 py-10 bg-emerald-50/50">
          <div className="w-full px-8 md:px-16">
            <p className="text-center text-xs font-bold text-black tracking-widest uppercase mb-8">Trusted by Africa's Leading Innovators</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {['Flutterwave', 'Paystack', 'Andela', 'M-PESA', 'Jumia'].map(name => (
                <div key={name} className="text-xl font-black text-black">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="py-24 px-8 md:px-16 w-full text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Popular Learning Paths</h2>
          <p className="text-black max-w-2xl mx-auto mb-16">Tailored curriculums designed for the unique challenges and opportunities of the African digital economy.</p>
          {topCategories.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-100 rounded-2xl h-40 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {topCategories.map((path, idx) => (
                <button key={idx} onClick={() => setView('CourseCatalog')} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#1e4c31] flex items-center justify-center mb-4">
                    <path.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{path.title}</h3>
                  <p className="text-sm text-gray-500">{path.courses}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Featured Courses */}
        <section className="py-24 px-8 md:px-16 bg-emerald-50">
          <div className="w-full">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black mb-4">Featured Courses</h2>
                <p className="text-black max-w-xl">Start learning with our most popular programs, led by industry experts across the continent.</p>
              </div>
              <button onClick={() => setView('CourseCatalog')} className="hidden md:flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                <span>View all courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-4 mb-12 overflow-x-auto pb-4 hide-scrollbar">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors border ${
                    selectedCategory === category 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                      : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coursesLoading ? (
                [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl overflow-hidden border border-emerald-100 h-80 animate-pulse" />)
              ) : courses.length === 0 ? (
                <p className="col-span-3 text-center text-gray-400 py-12">No courses available yet.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-emerald-100 flex flex-col cursor-pointer" onClick={() => setView('CourseCatalog')}>
                    <div className="relative h-48 bg-emerald-100">
                      {course.image_url
                        ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-emerald-400"><BookOpen className="w-12 h-12" /></div>
                      }
                      {course.category && (
                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{course.category}</div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center space-x-4 text-sm text-black mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{course._count?.enrollments ?? 0} learners</span>
                        </div>
                        <span>•</span>
                        <span className="capitalize">{course.level?.toLowerCase() ?? 'beginner'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-4 line-clamp-2">{course.title}</h3>
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${course.is_free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {course.is_free ? 'Free' : `${Number(course.price).toLocaleString()} RWF`}
                        </span>
                        <button className="text-black border border-emerald-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors">Details</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 text-center md:hidden">
              <button onClick={() => setView('CourseCatalog')} className="inline-flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                <span>View all courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-emerald-900 py-16 px-8 md:px-16">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-emerald-800">
            {statItems.map((stat, idx) => (
              <div key={idx} className="px-4">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-xs font-bold text-emerald-300 tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-8 md:px-16 max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl text-emerald-600 font-serif">"</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-emerald-900 leading-tight mb-10">
            "Uburiza Learn didn't just teach me how to code; it gave me the confidence to launch my own startup in Nairobi. The curriculum is perfectly suited for our market."
          </h2>
          <div className="flex flex-col items-center">
            <img src="https://i.pravatar.cc/150?img=32" alt="Fatima Diop" className="w-16 h-16 rounded-full border-4 border-white shadow-lg mb-4" />
            <h4 className="font-bold text-emerald-900 text-lg">Fatima Diop</h4>
            <p className="text-emerald-600">Founder, GreenTech Senegal</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-8 md:px-16 w-full">
          <div className="bg-[#1e4c31] rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to start your digital journey?</h2>
            <p className="text-emerald-200 text-base mb-8 max-w-xl mx-auto">Join thousands of students and build the future of Africa today. No credit card required to start.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button onClick={() => setView('Signup')} className="w-full sm:w-auto bg-white text-[#1e4c31] px-7 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm">
                Start Learning for Free
              </button>
              <button onClick={() => setView('CourseCatalog')} className="w-full sm:w-auto bg-transparent text-white px-7 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/10 transition-colors text-sm">
                Explore Courses
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-300">
              {['Expert Instructors', 'Verified Certificates', 'Offline Access'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer setView={setView} />
    </div>
  );
}
