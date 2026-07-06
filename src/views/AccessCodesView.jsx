import React, { useState } from 'react';
import { Plus, ChevronRight, KeyRound, Copy, Check, ArrowLeft } from 'lucide-react';
import { useGenerateAccessCodes, useCoursesWithAccessCodes, useAccessCodesByCourse, useAdminAllCourses, useDeleteExpiredCodes } from '../api/hooks/useCourse';

const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function CourseCodesList({ courseId, courseTitle, onBack }) {
  const { data: codes = [], isLoading } = useAccessCodesByCourse(courseId);
  const deleteExpired = useDeleteExpiredCodes(courseId);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const expiredCount = codes.filter((c) => c.expires_at && new Date(c.expires_at) < new Date()).length;

  function copyCode(id, code) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyAll() {
    navigator.clipboard.writeText(codes.map((c) => c.code).join('\n'));
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDeleteExpired() {
    await deleteExpired.mutateAsync();
    setConfirmDelete(false);
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-black">{courseTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{codes.length} access code{codes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {expiredCount > 0 && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Delete {expiredCount} expired?</span>
                <button onClick={handleDeleteExpired} disabled={deleteExpired.isPending} className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-60">
                  {deleteExpired.isPending ? 'Deleting...' : 'Confirm'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs font-bold text-gray-500 hover:text-black px-3 py-1.5 rounded-lg border border-gray-200">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                Delete Expired ({expiredCount})
              </button>
            )
          )}
          {codes.length > 0 && (
            <button
              onClick={copyAll}
              className="flex items-center gap-2 text-xs font-bold text-[#1e4c31] border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {copiedId === 'all' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading codes...</p>
      ) : codes.length === 0 ? (
        <p className="text-sm text-gray-400">No codes found for this course.</p>
      ) : (
        <div className="border border-emerald-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-emerald-100">
            {codes.map((c) => {
              const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
              const isExhausted = c.used_count >= c.max_uses;
              const status = isExpired ? 'expired' : isExhausted ? 'exhausted' : 'active';
              return (
                <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-black tracking-wider">{c.code}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-gray-500'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 text-right">
                      <span>{c.used_count}/{c.max_uses} uses</span>
                      {c.expires_at && <span className="ml-3">Exp: {new Date(c.expires_at).toLocaleDateString()}</span>}
                    </div>
                    <button onClick={() => copyCode(c.id, c.code)} className="text-gray-400 hover:text-[#1e4c31] transition-colors">
                      {copiedId === c.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccessCodesView() {
  const generateCodes = useGenerateAccessCodes();
  const { data: coursesWithCodes = [], isLoading: loadingCourses } = useCoursesWithAccessCodes();
  const { data: allCourses = [], isLoading: loadingAllCourses } = useAdminAllCourses(); // always fetch, used in generator

  const [selectedCourse, setSelectedCourse] = useState(null); // { id, title }
  const [showGenerator, setShowGenerator] = useState(false);
  const [form, setForm] = useState({ courseId: '', count: 10, maxUses: 1, expiresAt: '' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [newCodes, setNewCodes] = useState([]);

  async function handleGenerate() {
    setError('');
    if (!form.courseId) return setError('Please select a course.');
    if (!form.count || form.count < 1 || form.count > 500) return setError('Count must be between 1 and 500.');
    try {
      const res = await generateCodes.mutateAsync({
        courseId: form.courseId,
        count: Number(form.count),
        maxUses: Number(form.maxUses) || 1,
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      });
      setNewCodes(res.codes ?? []);
    } catch (err) {
      setError(err?.error ?? 'Failed to generate codes.');
    }
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(newCodes.map((c) => c.code).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Detail view ──
  if (selectedCourse) {
    return (
      <div className="p-8 max-w-3xl">
        <CourseCodesList
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  // ── Generator panel ──
  if (showGenerator) {
    return (
      <div className="p-8 max-w-2xl">
        <button onClick={() => { setShowGenerator(false); setNewCodes([]); setError(''); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl font-bold text-black mb-6">Generate New Codes</h2>

        <div className="space-y-5 mb-8">
          <Field label="Course" required>
            <select className={inputCls} value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
              <option value="">{loadingAllCourses ? 'Loading courses...' : 'Select a course'}</option>
              {allCourses.map((c) => <option key={c.id} value={c.id}>{c.title}{!c.published ? ' (unpublished)' : ''}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of Codes" required>
              <input type="number" min="1" max="500" value={form.count} onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))} className={inputCls} placeholder="10" />
            </Field>
            <Field label="Max Uses per Code">
              <input type="number" min="1" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} className={inputCls} placeholder="1" />
            </Field>
          </div>
          <Field label="Expiry Date (optional)">
            <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className={inputCls} />
          </Field>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleGenerate} disabled={generateCodes.isPending} className="bg-[#1e4c31] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 disabled:opacity-60 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {generateCodes.isPending ? 'Generating...' : 'Generate Codes'}
          </button>
        </div>

        {newCodes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-black">{newCodes.length} codes generated</h3>
              <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-xs font-bold text-[#1e4c31] border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
              </button>
            </div>
            <div className="border border-emerald-200 rounded-2xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto divide-y divide-emerald-100">
                {newCodes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-emerald-50">
                    <span className="font-mono text-sm font-bold text-black tracking-wider">{c.code}</span>
                    <div className="text-xs text-gray-400 flex gap-4">
                      <span>Max uses: {c.max_uses}</span>
                      {c.expires_at && <span>Expires: {new Date(c.expires_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Course list (default) ──
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Access Codes</h1>
          <p className="text-sm text-gray-500">Courses with generated access codes.</p>
        </div>
        <button
          onClick={() => { setShowGenerator(true); setNewCodes([]); setError(''); }}
          className="bg-[#1e4c31] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Generate Codes
        </button>
      </div>

      {loadingCourses ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : coursesWithCodes.length === 0 ? (
        <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <KeyRound className="w-10 h-10 text-emerald-200 mb-4" />
          <p className="text-sm font-bold text-black mb-1">No access codes yet</p>
          <p className="text-xs text-gray-400 mb-6">Generate codes for a course to get started.</p>
          <button onClick={() => setShowGenerator(true)} className="bg-[#1e4c31] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900">
            <Plus className="w-4 h-4 inline mr-2" />Generate Codes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coursesWithCodes.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse({ id: course.id, title: course.title })}
              className="w-full flex items-center justify-between p-5 bg-white border border-emerald-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-5 h-5 text-[#1e4c31]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">{course.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{course._count.access_codes} code{course._count.access_codes !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
