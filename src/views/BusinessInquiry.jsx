import React, { useState } from 'react';
import TopNavPublic from '../components/TopNavPublic';
import Footer from '../components/Footer';

export default function BusinessInquiry({ setView }) {
  const [formData, setFormData] = useState({ name: '', company: '', employees: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Uburiza Academy Business Inquiry');
    const body = encodeURIComponent(`Name: ${formData.name}\nCompany: ${formData.company}\nEmployees to train: ${formData.employees}\nEmail: ${formData.email}\n\nNeeds:\n${formData.message}`);
    window.location.href = `mailto:hello@uburiza.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <TopNavPublic setView={setView} />
      <main className="flex-1 py-16 px-8 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Uburiza Academy Business</h1>
          <p className="text-slate-600 mb-8">Upskill your team with our tailored digital courses for businesses and organizations.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Organization</label>
              <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Employees to train</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.employees} onChange={e => setFormData({...formData, employees: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What are your training needs?</label>
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
