import React, { useState } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';

export default function PartnerWithUs({ setView }) {
  const [formData, setFormData] = useState({ name: '', organization: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Partnership Inquiry');
    const body = encodeURIComponent(`Name: ${formData.name}\nOrganization: ${formData.organization}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:hello@uburiza.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />
      <main className="flex-1 py-16 px-8 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Partner With Us</h1>
          <p className="text-slate-600 mb-8">Organizations, schools, NGOs, and companies: let's work together to empower learners.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input required type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">How would you like to partner?</label>
              <textarea required rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
              Submit Inquiry
            </button>
          </form>
        </div>
      </main>
      <Footer setView={setView} />
    </div>
  );
}
