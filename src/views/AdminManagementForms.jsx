import React, { useState } from 'react';
import {
  Check, Edit2, Trash2, Plus, GripVertical, Info,
  Layers, PlayCircle, FileText, BookOpen, X,
  Star, Clock, Users, Play, CheckCircle2, ChevronDown, ChevronUp, Award,
} from 'lucide-react';
import {
  useCreateCourse, useUpdateCourse,
  useCreateModule, useUpdateModule, useDeleteModule,
  useCreateLesson, useUpdateLesson, useDeleteLesson,
  useCourse, useAdminLesson, useGenerateAccessCodes,
} from '../api/hooks/useCourse';

const STEPS = ['Course Details', 'Modules', 'Lessons', 'Quiz', 'Preview', 'Publish'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LESSON_TYPES = ['VIDEO', 'TEXT', 'QUIZ'];
const CATEGORIES = ['Agriculture', 'Technology', 'Business', 'Finance', 'Health'];

const emptyCourse = { title: '', description: '', thumbnail_url: '', price: '', category: '', level: 'BEGINNER', published: false, isPaid: false };
const emptyModule = { title: '', description: '' };
const emptyLesson = { title: '', description: '', content_url: '', text: '', type: 'VIDEO', duration_mins: '' };

// ─── Small reusable modal ─────────────────────────────────────────────────────
function Modal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-black mb-6">{title}</h2>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="border border-slate-300 px-5 py-2 rounded-lg text-sm font-medium text-black hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="bg-[#1e4c31] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-900 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

const emptyQuestion = () => ({ text: '', order_index: 0, options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] });
const emptyQuizForm = () => ({ pass_mark: 70, max_attempts: '', questions: [emptyQuestion()] });

// ─── Quiz Step ────────────────────────────────────────────────────────────────
function QuizStep({ modules, courseId, createLesson, updateLesson }) {
  const quizLessons = modules.flatMap((m) =>
    (m.lessons ?? []).filter((l) => l.type === 'QUIZ').map((l) => ({ ...l, moduleId: m.id, moduleName: m.title }))
  );

  const [selected, setSelected] = useState(quizLessons[0]?.id ?? '__new__');
  const [form, setForm] = useState(emptyQuizForm());
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: adminLesson, isLoading: loadingLesson } = useAdminLesson(selected);

  // Populate form when existing quiz lesson is loaded
  React.useEffect(() => {
    if (adminLesson?.quiz) {
      setForm({
        pass_mark: adminLesson.quiz.pass_mark,
        max_attempts: adminLesson.quiz.max_attempts ?? '',
        questions: adminLesson.quiz.questions.map((q) => ({
          text: q.text,
          order_index: q.order_index,
          options: q.options.map((o) => ({ text: o.text, is_correct: o.is_correct })),
        })),
      });
    } else if (selected === '__new__') {
      setForm(emptyQuizForm());
    }
  }, [adminLesson, selected]);

  function setPassMark(v) { setForm((f) => ({ ...f, pass_mark: Number(v) })); }
  function setMaxAttempts(v) { setForm((f) => ({ ...f, max_attempts: v })); }

  function addQuestion() {
    setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  }
  function removeQuestion(qi) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  }
  function updateQuestion(qi, field, value) {
    setForm((f) => {
      const questions = f.questions.map((q, i) => i === qi ? { ...q, [field]: value } : q);
      return { ...f, questions };
    });
  }
  function addOption(qi) {
    setForm((f) => {
      const questions = f.questions.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: '', is_correct: false }] } : q
      );
      return { ...f, questions };
    });
  }
  function removeOption(qi, oi) {
    setForm((f) => {
      const questions = f.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q
      );
      return { ...f, questions };
    });
  }
  function updateOption(qi, oi, field, value) {
    setForm((f) => {
      const questions = f.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, [field]: value } : o) } : q
      );
      return { ...f, questions };
    });
  }
  function setCorrect(qi, oi) {
    setForm((f) => {
      const questions = f.questions.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) } : q
      );
      return { ...f, questions };
    });
  }

  async function handleSave() {
    setError('');
    if (selected === '__new__') {
      if (!lessonTitle.trim()) return setError('Lesson title is required.');
      if (!lessonDesc.trim()) return setError('Lesson description is required.');
      if (!moduleId) return setError('Select a module.');
    }
    if (form.questions.length === 0) return setError('Add at least one question.');
    for (const q of form.questions) {
      if (!q.text.trim()) return setError('All questions must have text.');
      if (q.options.length < 2) return setError('Each question needs at least 2 options.');
      if (!q.options.some((o) => o.is_correct)) return setError('Each question needs at least one correct answer.');
      if (q.options.some((o) => !o.text.trim())) return setError('All option texts are required.');
    }
    setSaving(true);
    try {
      const quiz = {
        pass_mark: form.pass_mark,
        max_attempts: form.max_attempts ? parseInt(form.max_attempts) : undefined,
        questions: form.questions.map((q, i) => ({ text: q.text, order_index: i + 1, options: q.options })),
      };
      if (selected === '__new__') {
        const mod = modules.find((m) => m.id === moduleId);
        await createLesson.mutateAsync({
          moduleId,
          title: lessonTitle,
          description: lessonDesc,
          type: 'QUIZ',
          order_index: (mod?.lessons?.length ?? 0) + 1,
          quiz,
        });
      } else {
        await updateLesson.mutateAsync({ id: selected, quiz });
      }
    } catch (err) {
      setError(err?.error ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Quiz Builder</h1>
          <p className="text-sm text-gray-500">Create quizzes for your QUIZ-type lessons</p>
        </div>
      </div>

      {loadingLesson ? (
        <p className="text-sm text-gray-400">Loading quiz data...</p>
      ) : (
        <>
      {/* New lesson fields */}
      {selected === '__new__' && (
        <div className="mb-8 space-y-4 max-w-2xl p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <Field label="Module" required>
            <select className={inputCls} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </Field>
          <Field label="Lesson Title" required>
            <input className={inputCls} value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Module 1 Quiz" />
          </Field>
          <Field label="Description" required>
            <textarea className={`${inputCls} resize-none`} rows={2} value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} placeholder="What will this quiz assess?" />
          </Field>
        </div>
      )}

      {/* Quiz settings */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl mb-8">
        <Field label="Pass Mark (%)" required>
          <input className={inputCls} type="number" min="0" max="100" value={form.pass_mark} onChange={(e) => setPassMark(e.target.value)} />
        </Field>
        <Field label="Max Attempts (optional)">
          <input className={inputCls} type="number" min="1" value={form.max_attempts} onChange={(e) => setMaxAttempts(e.target.value)} placeholder="Unlimited" />
        </Field>
      </div>

      {/* Questions */}
      <div className="space-y-6 max-w-3xl">
        {form.questions.map((q, qi) => (
          <div key={qi} className="border border-emerald-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-emerald-100 text-[#1e4c31] text-xs font-bold px-3 py-1 rounded-md">Question {qi + 1}</span>
              {form.questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <Field label="Question Text" required>
              <textarea
                className={`${inputCls} resize-none`} rows={2}
                value={q.text}
                onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                placeholder="e.g. What is the primary goal of digital marketing?"
              />
            </Field>
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold text-black">Options <span className="text-gray-400 font-normal">(click circle to mark correct)</span></p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrect(qi, oi)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                      opt.is_correct ? 'bg-[#1e4c31] border-[#1e4c31]' : 'border-slate-300 hover:border-emerald-400'
                    }`}
                  />
                  <input
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={opt.text}
                    onChange={(e) => updateOption(qi, oi, 'text', e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="text-gray-300 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addOption(qi)} className="text-[#1e4c31] text-xs font-bold flex items-center gap-1 hover:underline mt-1">
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
          </div>
        ))}

        <button onClick={addQuestion} className="w-full border-2 border-dashed border-emerald-200 rounded-2xl py-4 flex items-center justify-center text-[#1e4c31] font-bold text-sm hover:bg-emerald-50 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="mt-8">
        <button onClick={handleSave} disabled={saving} className="bg-[#1e4c31] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
      </>
      )}
    </div>
  );
}

// ─── Access Codes Step ───────────────────────────────────────────────────────
function AccessCodesStep({ courseId, generateCodes }) {
  const [form, setForm] = useState({ count: 10, maxUses: 1, expiresAt: '' });
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError('');
    if (!form.count || form.count < 1 || form.count > 500) {
      return setError('Count must be between 1 and 500.');
    }
    try {
      const payload = {
        courseId,
        count: Number(form.count),
        maxUses: Number(form.maxUses) || 1,
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      };
      const res = await generateCodes.mutateAsync(payload);
      setGeneratedCodes(res.codes ?? []);
    } catch (err) {
      setError(err?.error ?? 'Failed to generate codes.');
    }
  }

  function handleCopyAll() {
    const text = generatedCodes.map((c) => c.code).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-1">Access Code Generator</h1>
        <p className="text-sm text-gray-500">Generate unique codes to grant learners access to this course.</p>
      </div>

      <div className="max-w-lg space-y-5 mb-8">
        <Field label="Number of Codes" required>
          <input
            type="number" min="1" max="500"
            value={form.count}
            onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
            className={inputCls}
            placeholder="e.g. 10"
          />
        </Field>
        <Field label="Max Uses per Code">
          <input
            type="number" min="1"
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            className={inputCls}
            placeholder="1"
          />
        </Field>
        <Field label="Expiry Date (optional)">
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={generateCodes.isPending}
          className="bg-[#1e4c31] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 disabled:opacity-60 flex items-center gap-2"
        >
          {generateCodes.isPending ? 'Generating...' : 'Generate Codes'}
        </button>
      </div>

      {generatedCodes.length > 0 && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-black">{generatedCodes.length} codes generated</h3>
            <button
              onClick={handleCopyAll}
              className="text-xs font-bold text-[#1e4c31] border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy All'}
            </button>
          </div>
          <div className="border border-emerald-200 rounded-2xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y divide-emerald-100">
              {generatedCodes.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-emerald-50">
                  <span className="font-mono text-sm font-bold text-black tracking-wider">{c.code}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
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

export default function AdminManagementForms({ setView, editCourseId, onEditDone }) {
  const [step, setStep] = useState(0);
  const [courseId, setCourseId] = useState(editCourseId ?? null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [courseError, setCourseError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  // module modal state
  const [moduleModal, setModuleModal] = useState(null); // null | { mode:'add'|'edit', data, moduleId? }
  const [moduleForm, setModuleForm] = useState(emptyModule);

  // lesson modal state
  const [lessonModal, setLessonModal] = useState(null); // null | { mode:'add'|'edit', moduleId, lessonId?, data }
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  // expanded modules in sidebar
  const [expandedModules, setExpandedModules] = useState({});

  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  // Pre-fill form when editing an existing course
  React.useEffect(() => {
    if (course && editCourseId && !prefilled) {
      setCourseForm({
        title: course.title ?? '',
        description: course.description ?? '',
        thumbnail_url: course.image_url ?? '',
        price: course.price ?? '',
        category: course.category ?? '',
        level: course.level ?? 'BEGINNER',
        published: course.published ?? false,
        isPaid: !!course.price,
      });
      setThumbnailFile(null);
      setPrefilled(true);
    }
  }, [course, editCourseId, prefilled]);

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const createModule = useCreateModule(courseId);
  const updateModule = useUpdateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const createLesson = useCreateLesson(courseId);
  const updateLesson = useUpdateLesson(courseId);
  const deleteLesson = useDeleteLesson(courseId);
  const generateCodes = useGenerateAccessCodes();

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const modules = course?.modules ?? [];

  // ─── Course step ────────────────────────────────────────────────────────────
  function handleCourseChange(e) {
    const { name, value, type, checked } = e.target;
    setCourseForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleThumbnailChange(e) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    setCourseForm((f) => ({
      ...f,
      thumbnail_url: file ? file.name : f.thumbnail_url,
    }));
  }

  async function handleCourseNext() {
    if (!courseForm.title.trim()) return setCourseError('Title is required.');
    if (!courseForm.description.trim()) return setCourseError('Description is required.');
    if (!courseForm.category.trim()) return setCourseError('Category is required.');
    if (courseForm.isPaid && !courseForm.price) return setCourseError('Price is required for paid courses.');
    setCourseError('');
    try {
      const payload = {
        title: courseForm.title,
        description: courseForm.description,
        imageFile: thumbnailFile,
        price: courseForm.isPaid ? parseFloat(courseForm.price) : undefined,
        is_free: !courseForm.isPaid,
        category: courseForm.category,
        level: courseForm.level,
        published: courseForm.published,
      };
      if (courseId) {
        await updateCourse.mutateAsync({ id: courseId, ...payload });
      } else {
        const res = await createCourse.mutateAsync(payload);
        setCourseId(res.course.id);
      }
      setStep(1);
    } catch (err) {
      setCourseError(err?.error ?? 'Something went wrong.');
    }
  }

  // ─── Module modal ────────────────────────────────────────────────────────────
  function openAddModule() {
    setModuleForm(emptyModule);
    setModuleModal({ mode: 'add' });
  }

  function openEditModule(mod) {
    setModuleForm({ title: mod.title, description: mod.description ?? '' });
    setModuleModal({ mode: 'edit', moduleId: mod.id });
  }

  async function saveModule() {
    if (!moduleForm.title.trim()) return;
    if (moduleModal.mode === 'add') {
      await createModule.mutateAsync({
        courseId,
        title: moduleForm.title,
        description: moduleForm.description || undefined,
        order_index: modules.length + 1,
      });
    } else {
      await updateModule.mutateAsync({
        id: moduleModal.moduleId,
        title: moduleForm.title,
        description: moduleForm.description || undefined,
      });
    }
    setModuleModal(null);
  }

  async function handleDeleteModule(moduleId) {
    if (!confirm('Delete this module and all its lessons?')) return;
    await deleteModule.mutateAsync(moduleId);
  }

  // ─── Lesson modal ────────────────────────────────────────────────────────────
  function openAddLesson(moduleId) {
    setLessonForm(emptyLesson);
    setLessonModal({ mode: 'add', moduleId });
  }

  function openEditLesson(moduleId, lesson) {
    setLessonForm({
      title: lesson.title,
      description: lesson.description ?? '',
      content_url: lesson.content_url ?? '',
      text: lesson.text ?? '',
      type: lesson.type,
      duration_mins: lesson.duration_mins ?? '',
    });
    setLessonModal({ mode: 'edit', moduleId, lessonId: lesson.id });
  }

  async function saveLesson() {
    if (!lessonForm.title.trim() || !lessonForm.description.trim()) return;
    if (lessonForm.type === 'VIDEO' && !lessonForm.content_url.trim()) return;
    const contentUrl = lessonForm.type === 'VIDEO' && lessonForm.content_url.trim() ? lessonForm.content_url : undefined;
    const text = lessonForm.type === 'TEXT' ? lessonForm.text : '  ';
    if (lessonModal.mode === 'add') {
      const mod = modules.find((m) => m.id === lessonModal.moduleId);
      await createLesson.mutateAsync({
        moduleId: lessonModal.moduleId,
        title: lessonForm.title,
        description: lessonForm.description,
        type: lessonForm.type,
        content_url: contentUrl,
        text,
        duration_mins: lessonForm.duration_mins ? parseInt(lessonForm.duration_mins) : undefined,
        order_index: (mod?.lessons?.length ?? 0) + 1,
      });
    } else {
      await updateLesson.mutateAsync({
        id: lessonModal.lessonId,
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        type: lessonForm.type,
        content_url: contentUrl,
        text,
        duration_mins: lessonForm.duration_mins ? parseInt(lessonForm.duration_mins) : undefined,
      });
    }
    setLessonModal(null);
  }

  async function handleDeleteLesson(lessonId) {
    if (!confirm('Delete this lesson?')) return;
    await deleteLesson.mutateAsync(lessonId);
  }

  const moduleSaving = createModule.isPending || updateModule.isPending;
  const lessonSaving = createLesson.isPending || updateLesson.isPending;
  const courseSaving = createCourse.isPending || updateCourse.isPending;

  function handleNext() {
    if (step === 0) return handleCourseNext();
    if (step === STEPS.length - 1) { onEditDone?.(); return setView('Analytics'); }
    setStep((s) => s + 1);
  }

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col h-screen overflow-hidden">

      {/* Module Modal */}
      {moduleModal && (
        <Modal
          title={moduleModal.mode === 'add' ? 'Add Module' : 'Edit Module'}
          onClose={() => setModuleModal(null)}
          onSave={saveModule}
          saving={moduleSaving}
        >
          <Field label="Module Title" required>
            <input className={inputCls} value={moduleForm.title} onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Marketing" />
          </Field>
          <Field label="Description">
            <textarea className={`${inputCls} resize-none`} rows={3} value={moduleForm.description} onChange={(e) => setModuleForm((f) => ({ ...f, description: e.target.value }))} placeholder="What will students learn?" />
          </Field>
        </Modal>
      )}

      {/* Lesson Modal */}
      {lessonModal && (
        <Modal
          title={lessonModal.mode === 'add' ? 'Add Lesson' : 'Edit Lesson'}
          onClose={() => setLessonModal(null)}
          onSave={saveLesson}
          saving={lessonSaving}
        >
          <Field label="Lesson Title" required>
            <input className={inputCls} value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Getting Started" />
          </Field>
          <Field label="Description" required>
            <textarea className={`${inputCls} resize-none`} rows={2} value={lessonForm.description} onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))} placeholder="What will students learn in this lesson?" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select className={inputCls} value={lessonForm.type} onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value }))}>
                {LESSON_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Duration (mins)">
              <input className={inputCls} type="number" min="0" value={lessonForm.duration_mins} onChange={(e) => setLessonForm((f) => ({ ...f, duration_mins: e.target.value }))} placeholder="12" />
            </Field>
          </div>
          {lessonForm.type === 'TEXT' ? (
            <Field label="Content">
              <textarea className={`${inputCls} resize-none`} rows={6} value={lessonForm.text} onChange={(e) => setLessonForm((f) => ({ ...f, text: e.target.value }))} placeholder="Write the lesson content here..." />
            </Field>
          ) : lessonForm.type === 'VIDEO' ? (
            <Field label="Video URL" required>
              <input className={inputCls} value={lessonForm.content_url} onChange={(e) => setLessonForm((f) => ({ ...f, content_url: e.target.value }))} placeholder="https://youtube.com/..." />
            </Field>
          ) : null}
        </Modal>
      )}

      {/* Top Stepper */}
      <div className="border-b border-slate-200 px-8 py-3 flex-shrink-0">
        {/* Row 1: steps + actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto flex-1 min-w-0">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 flex-shrink-0 ${i > step ? 'opacity-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    i < step ? 'bg-[#1e4c31]' : i === step ? 'border-2 border-[#1e4c31]' : 'border-2 border-slate-300'
                  }`}>
                    {i < step
                      ? <Check className="w-3.5 h-3.5 text-white" />
                      : <span className={`text-xs font-bold ${i === step ? 'text-[#1e4c31]' : 'text-black'}`}>{i + 1}</span>
                    }
                  </div>
                  <span className={`text-xs whitespace-nowrap ${i === step ? 'font-bold text-[#1e4c31]' : 'font-medium text-black'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="flex items-center gap-1.5 border border-emerald-300 text-[#1e4c31] px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-emerald-50 transition-colors">
              <FileText className="w-3.5 h-3.5" /><span>Save Draft</span>
            </button>
            <button onClick={handleNext} disabled={courseSaving} className="bg-[#1e4c31] text-white px-4 py-1.5 rounded-lg font-medium text-xs hover:bg-emerald-900 transition-colors flex items-center gap-1.5 disabled:opacity-60">
              <span>{courseSaving ? 'Saving...' : 'Next Step'}</span>
              <span className="text-base leading-none">›</span>
            </button>
          </div>
        </div>
        {/* Row 2: progress bar */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">Overall Progress</span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1e4c31] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-black w-8 text-right">{progress}%</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — live course structure */}
        <div className="w-80 border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-black">Course Structure</h2>
            <span className="bg-emerald-100 text-[#1e4c31] text-xs font-bold px-2 py-1 rounded-md">
              {modules.length} Module{modules.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {courseLoading && courseId && (
              <p className="text-xs text-gray-400">Loading...</p>
            )}
            {modules.map((mod) => (
              <div key={mod.id} className="border border-emerald-100 rounded-xl overflow-hidden bg-white">
                <div
                  className="bg-slate-50 p-3 flex items-center border-b border-emerald-100 cursor-pointer"
                  onClick={() => setExpandedModules((e) => ({ ...e, [mod.id]: !e[mod.id] }))}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm font-bold text-black truncate flex-1">{mod.title}</span>
                </div>
                {expandedModules[mod.id] && (
                  <div className="p-2 space-y-1">
                    {(mod.lessons ?? []).map((lesson) => (
                      <div key={lesson.id} className="flex items-center p-2 text-sm text-black hover:bg-emerald-50 rounded-lg cursor-pointer">
                        <PlayCircle className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {courseId && (
              <button onClick={openAddModule} className="flex items-center text-[#1e4c31] text-sm font-bold p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add New Module
              </button>
            )}
          </div>

          <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#1e4c31] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-black mb-1">Pro Tip</h4>
              <p className="text-xs text-black">Keep modules under 15 minutes to maximize student retention.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col relative pb-24">
          <div className="w-full p-10 flex-1">

            {/* ── Step 0: Course Details ── */}
            {step === 0 && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-black mb-1">Course Details</h1>
                  <p className="text-sm text-black">Fill in the basic information about your course</p>
                </div>
                {courseError && <p className="text-red-500 text-sm mb-4">{courseError}</p>}
                <div className="space-y-6 max-w-2xl">
                  <Field label="Course Title" required>
                    <input name="title" value={courseForm.title} onChange={handleCourseChange} placeholder="e.g. Digital Marketing for Agribusiness" className={inputCls} />
                  </Field>
                  <Field label="Description">
                    <textarea name="description" value={courseForm.description} onChange={handleCourseChange} rows={4} placeholder="What is this course about?" className={`${inputCls} resize-none`} />
                  </Field>
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Category">
                      <select name="category" value={courseForm.category} onChange={handleCourseChange} className={inputCls}>
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Level">
                      <select name="level" value={courseForm.level} onChange={handleCourseChange} className={inputCls}>
                        {LEVELS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Pricing</label>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setCourseForm((f) => ({ ...f, isPaid: false, price: '' }))}
                          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                            !courseForm.isPaid ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-slate-100'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseForm((f) => ({ ...f, isPaid: true }))}
                          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                            courseForm.isPaid ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-slate-100'
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Price (USD){courseForm.isPaid && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        name="price"
                        value={courseForm.price}
                        onChange={handleCourseChange}
                        type="number"
                        min="0"
                        placeholder="0.00"
                        disabled={!courseForm.isPaid}
                        className={`${inputCls} ${!courseForm.isPaid ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}`}
                      />
                    </div>
                  </div>
                  <Field label="Thumbnail Upload" required>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="block w-full text-sm text-black file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                      />
                      <p className="text-xs text-gray-500">
                        {thumbnailFile ? `Selected file: ${thumbnailFile.name}` : courseForm.thumbnail_url ? `Current thumbnail: ${courseForm.thumbnail_url}` : 'Upload an image for the course thumbnail.'}
                      </p>
                    </div>
                  </Field>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="published" name="published" checked={courseForm.published} onChange={handleCourseChange} className="w-4 h-4 accent-[#1e4c31]" />
                    <label htmlFor="published" className="text-sm font-medium text-black">Publish immediately</label>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Modules ── */}
            {step === 1 && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-black mb-1">Module Configuration</h1>
                    <p className="text-sm text-black">Define modules and organize your curriculum flow</p>
                  </div>
                  <button onClick={openAddModule} className="bg-[#1e4c31] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-900 transition-colors flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Module
                  </button>
                </div>

                {courseLoading && <p className="text-sm text-gray-400">Loading modules...</p>}

                {!courseLoading && modules.length === 0 && (
                  <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                    <Layers className="w-10 h-10 text-emerald-300 mb-4" />
                    <p className="text-sm font-bold text-black mb-1">No modules yet</p>
                    <p className="text-xs text-gray-400 mb-6">Start building your course by adding the first module.</p>
                    <button onClick={openAddModule} className="bg-[#1e4c31] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-900">
                      <Plus className="w-4 h-4 inline mr-2" />Add First Module
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="border border-emerald-200 rounded-2xl p-8 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <span className="bg-emerald-100 text-[#1e4c31] text-xs font-bold px-3 py-1 rounded-md tracking-wider uppercase">
                          Module {String(modIdx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openEditModule(mod)} className="text-gray-500 hover:text-black flex items-center text-sm font-medium">
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button onClick={() => handleDeleteModule(mod.id)} disabled={deleteModule.isPending} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-base font-bold text-black">{mod.title}</p>
                        {mod.description && <p className="text-sm text-gray-500 mt-1">{mod.description}</p>}
                      </div>

                      <div className="mt-6">
                        <h3 className="text-sm font-bold text-black flex items-center mb-4">
                          <BookOpen className="w-4 h-4 mr-2 text-[#1e4c31]" /> Lessons
                          <span className="ml-2 bg-slate-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">{mod.lessons?.length ?? 0}</span>
                        </h3>
                        <div className="space-y-3">
                          {(mod.lessons ?? []).map((lesson, lessonIdx) => (
                            <div key={lesson.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white hover:border-emerald-300 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
                                  {lessonIdx + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black">{lesson.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {lesson.type}{lesson.duration_mins ? ` • ${lesson.duration_mins} mins` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button onClick={() => openEditLesson(mod.id, lesson)} className="text-gray-400 hover:text-black"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteLesson(lesson.id)} disabled={deleteLesson.isPending} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => openAddLesson(mod.id)} className="w-full border-2 border-dashed border-emerald-200 rounded-xl py-4 flex items-center justify-center text-[#1e4c31] font-bold text-sm hover:bg-emerald-50 transition-colors">
                            <Plus className="w-4 h-4 mr-2" /> Add Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 3: Quiz ── */}
            {step === 3 && (
              <QuizStep modules={modules} courseId={courseId} createLesson={createLesson} updateLesson={updateLesson} />
            )}

            {/* ── Step 4: Preview ── */}
            {step === 4 && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-black mb-1">Course Preview</h1>
                  <p className="text-sm text-gray-500">This is how your course will appear to learners.</p>
                </div>

                {!course ? (
                  <p className="text-gray-400 text-sm">Loading preview...</p>
                ) : (
                  <div className="space-y-8 max-w-3xl">
                    {/* Hero */}
                    <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-emerald-50 p-8 flex flex-col md:flex-row gap-8">
                      {course.image_url && (
                        <img src={course.image_url} alt={course.title} className="w-full md:w-56 h-36 object-cover rounded-xl flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {course.category && <span className="bg-emerald-100 text-[#1e4c31] text-xs font-bold px-2 py-0.5 rounded-md uppercase">{course.category}</span>}
                          {course.level && <span className="bg-slate-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md">{course.level}</span>}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${course.price ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-white'}`}>
                            {course.price ? `$${course.price}` : 'Free'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-black mb-2">{course.title}</h2>
                        {course.description && <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>}
                        <div className="flex items-center gap-5 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course._count?.enrollments ?? 0} enrolled</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{modules.length} modules</span>
                          <span className="flex items-center gap-1"><PlayCircle className="w-4 h-4" />{modules.reduce((a, m) => a + (m.lessons?.length ?? 0), 0)} lessons</span>
                        </div>
                      </div>
                    </div>

                    {/* Curriculum */}
                    <div>
                      <h3 className="text-base font-bold text-black mb-4 flex items-center gap-2"><PlayCircle className="w-4 h-4 text-[#1e4c31]" />Curriculum</h3>
                      <div className="space-y-3">
                        {modules.map((mod, i) => (
                          <div key={mod.id} className="border border-emerald-100 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                              <span className="text-sm font-bold text-black">Module {i + 1}: {mod.title}</span>
                              <span className="text-xs text-gray-500">{mod.lessons?.length ?? 0} lessons</span>
                            </div>
                            {(mod.lessons ?? []).length > 0 && (
                              <div className="divide-y divide-slate-100">
                                {(mod.lessons ?? []).map((lesson) => (
                                  <div key={lesson.id} className="px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <PlayCircle className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-black">{lesson.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{lesson.type}{lesson.duration_mins ? ` • ${lesson.duration_mins}m` : ''}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {(step === 2) && courseId && (
              <AccessCodesStep courseId={courseId} generateCodes={generateCodes} />
            )}
            {(step === 2) && !courseId && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Please complete Course Details first.</p>
              </div>
            )}
            {(step === 5) && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Step {step + 1}: {STEPS[step]} — coming soon</p>
              </div>
            )}

          </div>{/* end w-full p-10 */}

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-64 right-0 border-t border-slate-200 bg-white p-4 px-10 flex items-center justify-between z-10" style={{ marginLeft: '20rem' }}>
            <button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} className="bg-white border border-slate-300 text-black font-bold px-8 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-40">
              Back
            </button>
            <div className="flex items-center space-x-6">
              <button className="text-black font-bold text-sm hover:underline">Save as Draft</button>
              <button onClick={handleNext} disabled={courseSaving} className="bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60">
                {courseSaving ? 'Saving...' : step === 0 ? 'Save & Continue' : step < STEPS.length - 1 ? `Continue to ${STEPS[step + 1]}` : 'Finish'}
              </button>
            </div>
          </div>
        </div>{/* end flex-1 overflow-y-auto */}
      </div>{/* end flex-1 flex */}
    </div>
  );
}
