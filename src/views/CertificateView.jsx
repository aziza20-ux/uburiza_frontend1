import React, { useState } from 'react';
import {
  ChevronLeft, Download, Share2, CheckCircle2, Award,
  Shield, ExternalLink, Search, Loader2, AlertCircle, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useUserCertificates } from '../api/hooks/useCertificates';
import * as certApi from '../api/certificate_api';

export default function CertificateView({ setView }) {
  const { user } = useAppContext();
  const { data: certificates = [], isLoading, isError, refetch } = useUserCertificates(user?.id);
  const [selected, setSelected] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [verifyUid, setVerifyUid] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showNewCertBanner, setShowNewCertBanner] = useState(false);

  // Check for recently earned certificates (within last 24 hours)
  const recentCertificates = certificates.filter(cert => {
    const issuedTime = new Date(cert.issued_at).getTime();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    return issuedTime > oneDayAgo;
  });

  // Show banner for new certificates
  React.useEffect(() => {
    if (recentCertificates.length > 0) {
      setShowNewCertBanner(true);
    }
  }, [recentCertificates.length]);

  // Select first cert by default once loaded, prioritize recent ones
  React.useEffect(() => {
    if (certificates.length > 0 && !selected) {
      const certToSelect = recentCertificates.length > 0 ? recentCertificates[0] : certificates[0];
      setSelected(certToSelect);
    }
  }, [certificates, selected, recentCertificates.length]);

  async function handleDownload(cert) {
    setDownloading(cert.id);
    try {
      const blob = await certApi.downloadCertificate(cert.course.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.certificate_uid}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloading(null);
    }
  }

  async function handleVerify() {
    if (!verifyUid.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await certApi.verifyCertificate(verifyUid.trim());
      setVerifyResult(res);
    } catch (e) {
      setVerifyResult({ valid: false, error: e?.error ?? 'Certificate not found.' });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="p-8 mx-auto space-y-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setView('Dashboard')}
          className="flex items-center text-gray-600 hover:text-black transition-colors font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <Award className="w-4 h-4" />
          {isLoading ? '...' : `${certificates.length} Certificate${certificates.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-black mb-1">My Certificates</h1>
        <p className="text-gray-500 text-sm">Earn certificates by completing all lessons in a course.</p>
      </div>

      {/* New Certificate Banner */}
      {showNewCertBanner && recentCertificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                🎉 New Certificate{recentCertificates.length > 1 ? 's' : ''} Earned!
              </h2>
            </div>
            <p className="text-emerald-100 mb-4">
              Congratulations! You've earned {recentCertificates.length} new certificate{recentCertificates.length > 1 ? 's' : ''} in the last 24 hours.
            </p>
            <div className="flex flex-wrap gap-2">
              {recentCertificates.map(cert => (
                <span key={cert.id} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {cert.course.title}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowNewCertBanner(false)}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-emerald-100 rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-5 bg-emerald-100 rounded w-3/4" />
              <div className="h-3 bg-emerald-100 rounded w-1/2" />
              <div className="h-8 bg-emerald-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load certificates. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && certificates.length === 0 && (
        <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-16 flex flex-col items-center text-center">
          <Award className="w-14 h-14 text-emerald-300 mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No certificates yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            Complete all lessons in a course to earn your certificate of completion.
          </p>
          <button
            onClick={() => setView('CourseCatalog')}
            className="bg-[#1e4c31] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-900 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      )}

      {/* Certificate list + preview */}
      {!isLoading && certificates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Earned Certificates</h2>
            {certificates.map((cert) => {
              const isRecent = recentCertificates.some(recent => recent.id === cert.id);
              return (
                <button
                  key={cert.id}
                  onClick={() => setSelected(cert)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                    selected?.id === cert.id
                      ? 'border-[#1e4c31] bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  {isRecent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-[#1e4c31]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black text-sm line-clamp-2">{cert.course.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Issued {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {isRecent && <span className="text-emerald-600 font-semibold ml-2">• NEW</span>}
                      </p>
                      <p className="text-xs text-emerald-600 font-mono mt-0.5">{cert.certificate_uid}</p>
                    </div>
                    {selected?.id === cert.id && <CheckCircle2 className="w-4 h-4 text-[#1e4c31] flex-shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Certificate preview */}
          {selected && (
            <div className="lg:col-span-2 space-y-6">
              {/* Certificate card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
                <div className="border-4 border-[#1e4c31] m-3 rounded-xl p-10 text-center relative bg-gradient-to-br from-white to-emerald-50">
                  <Award className="absolute top-6 right-6 w-14 h-14 text-emerald-100" strokeWidth={1} />
                  <Award className="absolute top-6 left-6 w-14 h-14 text-emerald-100" strokeWidth={1} />

                  <p className="text-[#1e4c31] tracking-widest font-bold text-xs uppercase mb-6">
                    Certificate of Completion
                  </p>

                  <p className="text-gray-500 italic mb-2 text-sm">This is to certify that</p>
                  <h2 className="text-4xl font-bold text-[#1e4c31] mb-4">
                    {user?.name || user?.username || 'Learner'}
                  </h2>

                  <p className="text-gray-600 mb-2 text-sm">has successfully completed the course</p>
                  <h1 className="text-2xl font-bold text-black mb-6 max-w-lg mx-auto leading-tight">
                    {selected.course.title}
                  </h1>

                  <div className="border-t border-emerald-200 pt-6 flex justify-between items-end px-4 text-left">
                    <div>
                      <div className="flex items-center text-[#1e4c31] font-bold text-xs mb-1">
                        <Shield className="w-4 h-4 mr-1.5" /> VERIFIED BY UBURIZA LEARN
                      </div>
                      <p className="text-xs text-gray-500">ID: {selected.certificate_uid}</p>
                      <p className="text-xs text-gray-500">
                        Issued: {new Date(selected.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-white border border-emerald-200 rounded-lg p-1 mb-1">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selected.certificate_uid)}`}
                          alt="QR Code"
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Scan to Verify</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload(selected)}
                  disabled={downloading === selected.id}
                  className="flex items-center gap-2 bg-[#1e4c31] hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                >
                  {downloading === selected.id
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                    : <><Download className="w-4 h-4" /> Download PDF</>
                  }
                </button>
                <button className="flex items-center gap-2 border border-emerald-300 text-[#1e4c31] px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-50 transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Shield, title: 'Verified', desc: 'Secured and verified by Uburiza Learn.' },
                  { icon: ExternalLink, title: 'Shareable', desc: 'Share on LinkedIn and other platforms.' },
                  { icon: Award, title: 'Recognized', desc: 'Industry-recognized certificate of completion.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                    <Icon className="w-5 h-5 text-[#1e4c31] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-black">{title}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate verifier */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-6 max-w-xl">
        <h3 className="font-bold text-black mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1e4c31]" /> Verify a Certificate
        </h3>
        <p className="text-xs text-gray-500 mb-4">Enter a certificate ID to verify its authenticity.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={verifyUid}
            onChange={(e) => setVerifyUid(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="e.g. A1B2C3D4E5F6G7H8"
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleVerify}
            disabled={verifying || !verifyUid.trim()}
            className="flex items-center gap-2 bg-[#1e4c31] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-900 disabled:opacity-60 transition-colors"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verify
          </button>
        </div>

        {verifyResult && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
            verifyResult.valid
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-100 text-red-700'
          }`}>
            {verifyResult.valid
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            }
            <div>
              {verifyResult.valid ? (
                <>
                  <p className="font-bold">Valid Certificate</p>
                  <p>Issued to: <span className="font-semibold">{verifyResult.issuedTo}</span></p>
                  <p>Course: <span className="font-semibold">{verifyResult.course}</span></p>
                  <p>Date: {new Date(verifyResult.issuedAt).toLocaleDateString()}</p>
                </>
              ) : (
                <p>{verifyResult.error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
