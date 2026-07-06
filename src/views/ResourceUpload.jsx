import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, FileText, Globe, Link2, CheckCircle2, Sparkles } from 'lucide-react';
import { useCourses } from '../api/hooks/useCourse';
import { uploadResource } from '../api/resource_api';

const CATEGORIES = ['General', 'Case Study', 'Template', 'Worksheet', 'Guide', 'Video', 'Dataset'];
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp';

const steps = [
  { id: 1, title: 'Choose visibility' },
  { id: 2, title: 'Add file details' },
  { id: 3, title: 'Review & publish' },
];

function StepHeader({ step }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {steps.map((item, index) => {
        const active = item.id === step;
        const done = item.id < step;
        return (
          <React.Fragment key={item.id}>
            <div className={`flex items-center gap-2 whitespace-nowrap ${done ? 'opacity-100' : active ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${done ? 'bg-emerald-800 text-white border-emerald-800' : active ? 'border-emerald-800 text-emerald-800' : 'border-slate-300 text-slate-400'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : item.id}
              </div>
              <span className={`text-sm font-semibold ${active ? 'text-emerald-800' : 'text-black'}`}>{item.title}</span>
            </div>
            {index < steps.length - 1 && <div className="w-8 h-px bg-slate-200 flex-shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ResourceUpload({ setView }) {
  const { data: courses = [], isLoading } = useCourses({ published: true });
  const [step, setStep] = useState(1);
  const [visibility, setVisibility] = useState('public');
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courses, courseId]
  );

  const fileLabel = file ? file.name : 'No file selected yet';
  const modeLabel = visibility === 'public' ? 'Public resource' : 'Course-linked resource';

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    if (!title && selectedFile) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(baseName.replace(/[_-]+/g, ' '));
    }
  }

  function nextStep() {
    setError('');

    if (step === 1) {
      if (visibility === 'course' && !courseId) {
        setError('Select a course before continuing.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!title.trim()) {
        setError('Provide a resource title.');
        return;
      }
      if (!file) {
        setError('Choose a file to upload.');
        return;
      }
      setStep(3);
    }
  }

  function prevStep() {
    setError('');
    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await uploadResource({
        title: title.trim(),
        category,
        ...(visibility === 'course' ? { courseId } : {}),
        file,
      });
      setMessage('Resource uploaded successfully.');
      setStep(4);
    } catch (err) {
      setError(err?.error ?? 'Failed to upload resource.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 text-black">
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <button onClick={() => setView('Analytics')} className="text-sm font-semibold text-emerald-800 hover:text-emerald-700 mb-4 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to analytics
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Resource Builder
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-3">Create a public or course-linked resource</h1>
            <p className="text-black/80 max-w-2xl">
              Follow the guided steps to upload a file, tag it properly, and publish it either independently or under a specific course.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white border border-emerald-200 rounded-2xl px-4 py-3 shadow-sm">
            <Upload className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Mode</p>
              <p className="font-semibold text-black">{modeLabel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-[2rem] shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-100 bg-emerald-50/60">
            <StepHeader step={step} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0">
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-emerald-100">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Who should see this resource?</h2>
                    <p className="text-sm text-black/70">Choose whether this file is available to everyone or linked to a course.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setVisibility('public')}
                      className={`text-left rounded-2xl border p-5 transition-all ${visibility === 'public' ? 'border-emerald-700 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-black">Public resource</p>
                          <p className="text-xs text-black/60">No course required</p>
                        </div>
                      </div>
                      <p className="text-sm text-black/80">Use this for downloadable guides, general templates, or assets shared across the platform.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('course')}
                      className={`text-left rounded-2xl border p-5 transition-all ${visibility === 'course' ? 'border-emerald-700 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-black">Course-linked resource</p>
                          <p className="text-xs text-black/60">Attach to a course</p>
                        </div>
                      </div>
                      <p className="text-sm text-black/80">Attach the file to a course so enrolled learners can access it in context.</p>
                    </button>
                  </div>

                  {visibility === 'course' && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <label className="block text-sm font-bold mb-2">Select course</label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Choose a course...</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      {isLoading && <p className="text-xs text-gray-500 mt-2">Loading courses...</p>}
                      {!isLoading && courses.length === 0 && <p className="text-xs text-gray-500 mt-2">No published courses available.</p>}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Add file details</h2>
                    <p className="text-sm text-black/70">Upload the file and give it a clear title so it’s easy to find later.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Resource title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Marketing Playbook"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Upload file</label>
                      <input
                        type="file"
                        accept={ACCEPTED_TYPES}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-black file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-900"
                      />
                      <p className="text-xs text-gray-500 mt-2">Accepted: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, WEBP.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Review & publish</h2>
                    <p className="text-sm text-black/70">Confirm the details before sending the upload to the server.</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Visibility</p>
                      <p className="font-semibold text-black">{visibility === 'public' ? 'Public resource' : `Linked to ${selectedCourse?.title ?? 'selected course'}`}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</p>
                      <p className="font-semibold text-black">{title}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Category</p>
                      <p className="font-semibold text-black">{category}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">File</p>
                      <p className="font-semibold text-black">{fileLabel}</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex min-h-[280px] items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Upload complete</h2>
                    <p className="text-black/70 mb-6">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setVisibility('public');
                          setCourseId('');
                          setTitle('');
                          setCategory('General');
                          setFile(null);
                          setError('');
                          setMessage('');
                        }}
                        className="bg-emerald-800 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-900"
                      >
                        Create another
                      </button>
                      <button
                        type="button"
                        onClick={() => setView('Resources')}
                        className="border border-slate-200 px-5 py-3 rounded-xl font-semibold hover:bg-slate-50"
                      >
                        View Resources
                      </button>
                      <button
                        type="button"
                        onClick={() => setView('Analytics')}
                        className="border border-slate-200 px-5 py-3 rounded-xl font-semibold hover:bg-slate-50"
                      >
                        Back to analytics
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
            </div>

            <div className="p-6 lg:p-8 bg-emerald-50/40">
              <div className="sticky top-6 space-y-5">
                <div className="rounded-3xl bg-white border border-emerald-100 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wider font-bold text-emerald-700 mb-2">Current mode</p>
                  <h3 className="text-2xl font-bold text-black mb-3">{modeLabel}</h3>
                  <p className="text-sm text-black/70">
                    {visibility === 'public'
                      ? 'This resource will be independently available to learners who have access to the public resource area.'
                      : 'This resource will be attached to the selected course and shown in course context.'}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#1e4c31] text-white p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-100">Step guide</p>
                      <p className="font-semibold">One file at a time</p>
                    </div>
                  </div>
                  <ol className="space-y-3 text-sm text-emerald-50">
                    <li className="flex gap-3"><span className="font-bold">1.</span> Pick public or course-linked.</li>
                    <li className="flex gap-3"><span className="font-bold">2.</span> Add the file title, category, and upload.</li>
                    <li className="flex gap-3"><span className="font-bold">3.</span> Review the summary and publish.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 lg:px-8 py-5 border-t border-emerald-100 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 && (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900 disabled:opacity-60"
              >
                <Upload className="w-4 h-4" /> {submitting ? 'Publishing...' : 'Publish resource'}
              </button>
            )}

            {step === 4 && <div />}
          </div>
        </div>
      </div>
    </div>
  );
}
