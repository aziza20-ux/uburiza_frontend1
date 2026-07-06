import React, { useState } from 'react';
import {
  CreditCard, Phone, CheckCircle2, Loader2, AlertCircle,
  ChevronRight, ArrowLeft, ShieldCheck, BookOpen, Clock, Layers,
} from 'lucide-react';
import TopNavPublic from '../components/TopNavPublic';
import { useInitiatePayment, useConfirmPayment } from '../api/hooks/usePayments';

const PROVIDERS = [
  { id: 'mtn_momo',     label: 'MTN Mobile Money',    icon: '📱', desc: 'Pay via MTN MoMo push notification' },
  { id: 'airtel_money', label: 'Airtel Money',         icon: '📲', desc: 'Pay via Airtel Money push notification' },
  { id: 'card',         label: 'Credit / Debit Card',  icon: '💳', desc: 'Visa, Mastercard accepted' },
];

const CURRENCIES = ['RWF', 'USD', 'KES', 'UGX'];

const STEPS = ['Select Method', 'Confirm Payment', 'Enrolled'];

export default function PaymentPage({ course, setView, onSuccess }) {
  const [step, setStep] = useState(0); // 0=select | 1=confirm | 2=success
  const [provider, setProvider] = useState('mtn_momo');
  const [currency, setCurrency] = useState('RWF');
  const [phone, setPhone] = useState('');
  const [providerReference, setProviderReference] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const initiate = useInitiatePayment();
  const confirm  = useConfirmPayment();

  async function handleInitiate() {
    setError('');
    try {
      const res = await initiate.mutateAsync({ courseId: course.id, currency, provider });
      setPayment(res.payment);
      setStep(1);
    } catch (err) {
      setError(err?.error ?? 'Failed to initiate payment. Please try again.');
    }
  }

  async function handleConfirm() {
    setError('');
    try {
      await confirm.mutateAsync({
        paymentId: payment.id,
        providerReference: providerReference || undefined,
      });
      setStep(2);
    } catch (err) {
      setError(err?.error ?? 'Failed to confirm payment. Please try again.');
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <TopNavPublic setView={setView} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">

        {/* Back button */}
        {step < 2 && (
          <button
            onClick={() => step === 0 ? setView('CourseOverview') : setStep(0)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step  ? 'bg-[#1e4c31] text-white' :
                  i === step ? 'border-2 border-[#1e4c31] text-[#1e4c31]' :
                               'border-2 border-slate-200 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${i === step ? 'font-bold text-[#1e4c31]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-16 md:w-24 mb-4 mx-1 transition-colors ${i < step ? 'bg-[#1e4c31]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left: step content ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Step 0: Select method ── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">Choose Payment Method</h1>
                  <p className="text-sm text-gray-500">Select how you'd like to pay for this course.</p>
                </div>

                <div className="space-y-3">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all text-left ${
                        provider === p.id
                          ? 'border-[#1e4c31] bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">{p.label}</p>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        provider === p.id ? 'border-[#1e4c31] bg-[#1e4c31]' : 'border-slate-300'
                      }`}>
                        {provider === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {(provider === 'mtn_momo' || provider === 'airtel_money') && (
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+250 7XX XXX XXX"
                          className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleInitiate}
                  disabled={initiate.isPending}
                  className="w-full bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                >
                  {initiate.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    : <><CreditCard className="w-5 h-5" /> Proceed to Pay <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            )}

            {/* ── Step 1: Confirm ── */}
            {step === 1 && payment && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">Confirm Your Payment</h1>
                  <p className="text-sm text-gray-500">Complete the payment on your device then confirm below.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <p className="font-bold text-amber-800 mb-1">Payment Initiated</p>
                  <p className="text-sm text-amber-700">
                    Complete your payment via{' '}
                    <span className="font-semibold">{provider.replace(/_/g, ' ').toUpperCase()}</span>{' '}
                    using the number <span className="font-semibold">{phone || 'your registered number'}</span>.
                    Once done, enter your transaction reference below.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment Reference</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{payment.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Transaction Reference <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={providerReference}
                    onChange={(e) => setProviderReference(e.target.value)}
                    placeholder="e.g. TXN123456789"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 mt-1">Provided by your mobile money or bank after successful transaction.</p>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={confirm.isPending}
                  className="w-full bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                >
                  {confirm.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</>
                    : <><CheckCircle2 className="w-5 h-5" /> Confirm & Enroll</>
                  }
                </button>
              </div>
            )}

            {/* ── Step 2: Success ── */}
            {step === 2 && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-11 h-11 text-[#1e4c31]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">You're Enrolled!</h2>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Payment confirmed. You now have full access to{' '}
                    <span className="font-semibold text-black">{course.title}</span>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={onSuccess}
                    className="bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
                  >
                    Start Learning
                  </button>
                  <button
                    onClick={() => setView('MyCourses')}
                    className="border border-emerald-300 text-[#1e4c31] font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    My Courses
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          {step < 2 && (
            <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {course.thumbnail_url && (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{course.category}</p>
                    <h3 className="font-bold text-black text-base leading-snug">{course.title}</h3>
                    {course.level && (
                      <span className="inline-block mt-1 text-xs bg-slate-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        {course.level}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {course.modules?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>{course.modules.length} modules</span>
                      </div>
                    )}
                    {course._count?.enrollments != null && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>{course._count.enrollments} learners enrolled</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Course price</span>
                      <span className="font-black text-xl text-[#1e4c31]">
                        {currency} {Number(course.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">One-time payment. Lifetime access.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1e4c31] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-black">30-Day Money-Back</p>
                  <p className="text-xs text-gray-500">Full refund if not satisfied within 30 days.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
