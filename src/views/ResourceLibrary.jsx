import React, { useState, useRef, useEffect } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';
import {
  Filter, Search, Download, FileText, FileSpreadsheet, File, Video,
  ArrowRight, MoreVertical, Edit2, Trash2, Upload, X, Check,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from '../api/hooks/useResources';

const CATEGORIES = ['Agriculture', 'Technology', 'Business', 'Finance', 'Health', 'Other'];
const TYPES = ['PDF', 'DOC', 'XLS', 'VIDEO'];
const FILTERS = ['All', 'PDF', 'DOC', 'XLS', 'VIDEO'];

const emptyForm = { title: '', description: '', category: '', type: 'PDF', file: null, file_url: '' };

// ─── Step-by-step upload modal ────────────────────────────────────────────────
const STEPS = ['Details', 'File', 'Review'];

function UploadStepper({ initial, onClose, onSave, saving, error }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial ?? emptyForm);
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.category && form.type;
    if (step === 1) return form.file || form.file_url.trim();
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>

        {/* Step indicators */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${i < step ? 'bg-[#1e4c31] border-[#1e4c31] text-white' : i === step ? 'border-[#1e4c31] text-[#1e4c31]' : 'border-slate-200 text-slate-400'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-[#1e4c31]' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-[#1e4c31]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Title <span className="text-red-500">*</span></label>
              <input className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Digital Strategy Guide" />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Description</label>
              <textarea className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of this resource" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Category <span className="text-red-500">*</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Type <span className="text-red-500">*</span></label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — File */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-emerald-600 mb-3" />
              {form.file ? (
                <p className="font-medium text-black text-sm">{form.file.name}</p>
              ) : (
                <>
                  <p className="font-medium text-black mb-1">Click to upload file</p>
                  <p className="text-xs text-gray-400">PDF, DOC, XLS, MP4 up to 500MB</p>
                </>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => set('file', e.target.files[0] ?? null)} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">External URL</label>
              <input className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.file_url} onChange={(e) => set('file_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-bold text-black mb-4">Review before saving</h3>
            {[
              ['Title', form.title],
              ['Description', form.description || '—'],
              ['Category', form.category],
              ['Type', form.type],
              ['File', form.file?.name || form.file_url || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-black font-semibold text-right max-w-xs truncate">{value}</span>
              </div>
            ))}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            className="border border-slate-300 px-5 py-2 rounded-lg text-sm font-medium text-black hover:bg-slate-50">
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className="bg-[#1e4c31] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => onSave(form)} disabled={saving}
              className="bg-[#1e4c31] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-900 disabled:opacity-60">
              {saving ? 'Saving...' : 'Publish Resource'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card menu ────────────────────────────────────────────────────────────────
function CardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-36 py-1">
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-emerald-50">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function getDisplayType(resource) {
  const mime = resource.file_type ?? '';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('word') || mime.includes('msword')) return 'DOC';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'PPT';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('image/')) return 'IMG';
  return resource.type ?? 'FILE';
}

function TypeIcon({ type }) {
  const cls = 'w-6 h-6';
  if (type === 'XLS') return <FileSpreadsheet className={cls} />;
  if (type === 'VIDEO') return <Video className={cls} />;
  if (type === 'DOC') return <File className={cls} />;
  return <FileText className={cls} />;
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function ResourceLibrary({ setView }) {
  const { userRole } = useAppContext();
  const isAdmin = userRole === 'admin';

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [stepper, setStepper] = useState(null);
  const [stepperError, setStepperError] = useState('');
  const [confirm, setConfirm] = useState(null); // { id }

  const params = activeFilter !== 'All' ? { type: activeFilter } : {};
  const { data: resources = [], isLoading } = useResources(params);
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const filtered = resources.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(form) {
    setStepperError('');
    try {
      if (stepper.mode === 'create') {
        await createResource.mutateAsync(form);
      } else {
        await updateResource.mutateAsync({ id: stepper.resource.id, ...form });
      }
      setStepper(null);
    } catch (err) {
      setStepperError(err?.error ?? 'Something went wrong.');
    }
  }

  async function handleDelete(id) {
    setConfirm({ id });
  }

  const saving = createResource.isPending || updateResource.isPending;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />
      {stepper && (
        <UploadStepper
          initial={stepper.mode === 'edit' ? { title: stepper.resource.title, description: stepper.resource.description ?? '', category: stepper.resource.category, type: stepper.resource.type, file: null, file_url: stepper.resource.file_url ?? '' } : emptyForm}
          onClose={() => setStepper(null)}
          onSave={handleSave}
          saving={saving}
          error={stepperError}
        />
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-black mb-2">Delete Resource</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to <span className="font-semibold text-black">delete this resource</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm font-medium border border-emerald-200 rounded-lg hover:bg-emerald-50 text-black">Cancel</button>
              <button
                onClick={async () => { await deleteResource.mutateAsync(confirm.id); setConfirm(null); }}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 mx-auto space-y-8 flex-grow w-full">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block bg-emerald-50 text-black text-xs font-semibold px-3 py-1 rounded-full mb-4">Knowledge Hub</div>
            <h1 className="text-4xl font-bold text-black mb-2">Resource <span className="text-black">Library</span></h1>
            <p className="text-black max-w-xl">Access curated toolkits, guides, and templates designed to accelerate your growth.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <div className="relative">
              <Search className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-72 shadow-sm" />
            </div>
            {isAdmin && (
              <button onClick={() => { setStepperError(''); setStepper({ mode: 'create' }); }}
                className="bg-[#1e4c31] text-white px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-900 whitespace-nowrap">
                <Upload className="w-4 h-4" /> Upload Resource
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button className="flex items-center justify-center p-2 rounded-lg border border-emerald-200 text-black hover:bg-emerald-50">
              <Filter className="w-4 h-4" />
            </button>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${activeFilter === f ? 'bg-emerald-800 text-white' : 'text-black border border-emerald-200 hover:bg-emerald-50'}`}>
                {f === 'All' ? 'All Resources' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="font-semibold text-black text-sm">
          Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} <span className="font-normal">— {activeFilter === 'All' ? 'All Categories' : activeFilter}</span>
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No resources found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((resource) => (
              <div key={resource.id} className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <TypeIcon type={getDisplayType(resource)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{getDisplayType(resource)}</span>
                    {isAdmin && (
                      <CardMenu
                        onEdit={() => { setStepperError(''); setStepper({ mode: 'edit', resource }); }}
                        onDelete={() => handleDelete(resource.id)}
                      />
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-black mb-2">{resource.title}</h3>
                <p className="text-sm text-black mb-6 flex-grow line-clamp-3">{resource.description}</p>
                <div className="space-y-1 mb-6">
                  <div className="text-xs text-black">{resource.category}</div>
                  {resource.updated_at && (
                    <div className="text-xs text-gray-400">Updated {new Date(resource.updated_at).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="border-t border-emerald-100 pt-4 flex justify-between items-center mt-auto">
                  <div>
                    {resource.file_size && (
                      <>
                        <p className="text-[10px] text-black font-bold uppercase tracking-wider">SIZE</p>
                        <p className="text-sm font-semibold text-black">{resource.file_size}</p>
                      </>
                    )}
                  </div>
                  {(resource.file_url || resource.download_url) && (
                    <a href={resource.file_url || resource.download_url} target="_blank" rel="noreferrer"
                      className="bg-[#1e4c31] hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                      <Download className="w-4 h-4 mr-1.5" /> Get File
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Can't find */}
        <div className="bg-white border border-emerald-200 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center my-8">
          <h3 className="text-lg font-bold text-black mb-2">Can't find what you're looking for?</h3>
          <p className="text-black mb-6 max-w-md">Our team regularly updates the library based on learner feedback.</p>
          <button onClick={() => setView('CourseCatalog')}
            className="text-black border border-emerald-300 px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center hover:bg-emerald-50 transition-colors">
            Browse Full Catalog <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <Footer setView={setView} />
    </div>
  );
}
