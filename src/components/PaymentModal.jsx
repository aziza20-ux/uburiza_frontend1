import React, { useState } from 'react';
import { X, CreditCard, Phone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useInitiatePayment, useConfirmPayment } from '../api/hooks/usePayments';

const PROVIDERS = [
  { id: 'mtn_momo', label: 'MTN Mobile Money', icon: '📱' },
  { id: 'airtel_money', label: 'Airtel Money', icon: '📲' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
];

const CURRENCIES = ['RWF', 'USD', 'KES', 'UGX'];

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [step, setStep] = useState('select'); // select | confirm | success
  const [provider, setProvider] = useState('mtn_momo');
  const [currency, setCurrency] = useState('RWF');
  const [phone, setPhone] = useState('');
  const [providerReference, setProviderReference] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const initiate = useInitiatePayment();
  const confirm = useConfirmPayment();

  async function handleInitiate() {
    setError('');
    try {
      const res = await initiate.mutateAsync({ courseId: course.id, currency, provider });
      setPayment(res.payment);
      setStep('confirm');
    } catch (err) {
      setError(err?.error ?? 'Failed to initiate payment.');
    }
  }

  async function handleConfirm() {
    setError('');
    try {
      await confirm.mutateAsync({
        paymentId: payment.id,
        providerReference: providerReference || undefined,
      });
      setStep('success');
    } catch (err) {
      setError(err?.error ?? 'Failed to confirm payment.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative my-auto">
        {/* Header */}
        <div className="bg-[#1e4c31] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs font-medium mb-0.5">Course Enrollment</p>
            <h2 className="text-white font-bold text-lg line-clamp-1">{course.title}</h2>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Price badge */}
          {step !== 'success' && (
            <div className="flex items-center justify-between mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-sm text-gray-600">Course Price</span>
              <span className="text-2xl font-black text-[#1e4c31]">
                {currency} {Number(course.price).toLocaleString()}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Select provider */}
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-black mb-3">Select Payment Method</p>
                <div className="space-y-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
                        provider === p.id
                          ? 'border-[#1e4c31] bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-sm font-medium text-black">{p.label}</span>
                      {provider === p.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#1e4c31] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-black mb-2">Currency</p>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {(provider === 'mtn_momo' || provider === 'airtel_money') && (
                <div>
                  <p className="text-sm font-bold text-black mb-2">Phone Number</p>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 7XX XXX XXX"
                      className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleInitiate}
                disabled={initiate.isPending}
                className="w-full bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {initiate.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Proceed to Pay</>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Confirm payment */}
          {step === 'confirm' && payment && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-bold mb-1">Payment Initiated</p>
                <p>Complete your payment via <span className="font-semibold">{provider.replace('_', ' ').toUpperCase()}</span> then enter the transaction reference below to confirm.</p>
              </div>

              <div className="text-xs text-gray-400 font-mono bg-slate-50 rounded-lg px-3 py-2">
                Payment ID: {payment.id}
              </div>

              <div>
                <p className="text-sm font-bold text-black mb-2">Transaction Reference <span className="text-gray-400 font-normal">(optional)</span></p>
                <input
                  type="text"
                  value={providerReference}
                  onChange={(e) => setProviderReference(e.target.value)}
                  placeholder="e.g. TXN123456789"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleConfirm}
                disabled={confirm.isPending}
                className="w-full bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {confirm.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm Payment & Enroll</>
                )}
              </button>

              <button onClick={() => setStep('select')} className="w-full text-sm text-gray-500 hover:text-black py-2">
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-[#1e4c31]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-1">You're enrolled!</h3>
                <p className="text-sm text-gray-500">Payment confirmed. You now have full access to <span className="font-semibold text-black">{course.title}</span>.</p>
              </div>
              <button
                onClick={onSuccess}
                className="w-full bg-[#1e4c31] hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
