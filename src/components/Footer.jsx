import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer({ setView }) {
  return (
    <footer className="bg-white border-t border-emerald-200 py-16 px-8 md:px-16">
      <div className="w-full px-8 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>Uburiza Learn</span>
          </div>
          <p className="text-black text-sm mb-8">
            Empowering the next generation of African digital leaders through premium, accessible education.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-4">Platform</h4>
          <ul className="space-y-3 text-sm text-black">
            <li><a href="#" className="hover:text-gray-700 transition-colors">Course Catalog</a></li>
            <li><a href="#" className="hover:text-gray-700 transition-colors">Resource Library</a></li>
            <li><a href="#" className="hover:text-gray-700 transition-colors">Success Stories</a></li>
            <li><a href="#" className="hover:text-gray-700 transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-4">Community & Partners</h4>
          <ul className="space-y-3 text-sm text-black">
            <li><button onClick={() => setView?.('PartnerWithUs')} className="hover:text-gray-700 transition-colors">Partner With Us</button></li>
            <li><button onClick={() => setView?.('TeachWithUs')} className="hover:text-gray-700 transition-colors">Teach on Uburiza Academy</button></li>
            <li><button onClick={() => setView?.('BusinessInquiry')} className="hover:text-gray-700 transition-colors">Uburiza Academy Business</button></li>
            <li><a href="#" className="hover:text-gray-700 transition-colors">Events</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-black mb-4">Stay Inspired</h4>
          <p className="text-sm text-black mb-4">
            Join our newsletter for the latest tech skills and opportunities.
          </p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Email address" 
              className="px-4 py-2 border border-slate-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full text-sm"
            />
            <button className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-full px-8 md:px-16 mt-16 pt-8 border-t border-emerald-100 flex flex-col md:flex-row justify-between items-center text-sm text-black">
        <p>Built for the future of Africa. © 2024 Uburiza Learn.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-emerald-700 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-700 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
