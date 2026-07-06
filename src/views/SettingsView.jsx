import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, Save, Camera, Loader2 } from 'lucide-react';
import { useMyProfile, useUpdateProfile, useChangePassword } from '../api/hooks/useProfile';
import { useAppContext } from '../context/AppContext';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'account', name: 'Account', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: profile, isLoading } = useMyProfile();
  const { user } = useAppContext();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile form state
  const [form, setForm] = useState({ first_name: '', last_name: '', bio: '', job_title: '' });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const fileInputRef = useRef();

  // Password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Notification toggles (local only — no backend endpoint for these)
  const [notifs, setNotifs] = useState([true, false, true, true]);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        bio: profile.bio ?? '',
        job_title: profile.job_title ?? '',
      });
    }
  }, [profile]);

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleProfileSave = () => {
    const fd = new FormData();
    fd.append('first_name', form.first_name);
    fd.append('last_name', form.last_name);
    fd.append('bio', form.bio);
    fd.append('job_title', form.job_title);
    if (pictureFile) fd.append('picture', pictureFile);
    updateProfile.mutate(fd);
  };

  const handlePasswordSave = () => {
    setPwError('');
    setPwSuccess('');
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError('Both current and new password are required.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    changePassword.mutate(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      {
        onSuccess: () => {
          setPwSuccess('Password changed successfully.');
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (err) => setPwError(err?.error ?? 'Failed to change password.'),
      }
    );
  };

  const avatarSrc = picturePreview ?? profile?.picture_url ?? `https://i.pravatar.cc/150?img=11`;

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-black mb-8">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-emerald-50/50 border-b md:border-b-0 md:border-r border-emerald-100 p-6">
          <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-emerald-100 text-black font-semibold' : 'text-black hover:bg-emerald-50'
                }`}
              >
                <tab.icon className="w-5 h-5 text-black" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6 border-b border-emerald-100 pb-4">Profile Information</h2>

              {isLoading ? (
                <div className="flex items-center space-x-3 text-black"><Loader2 className="w-5 h-5 animate-spin" /><span>Loading profile…</span></div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <img src={avatarSrc} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-emerald-50 object-cover" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                    </div>
                    <div>
                      <p className="font-semibold text-black">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, GIF or PNG. Max 800KB</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">First Name</label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                        className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                        className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">Bio</label>
                      <textarea
                        rows={4}
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">Job Title</label>
                      <input
                        type="text"
                        value={form.job_title}
                        onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                        className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {updateProfile.isSuccess && (
                    <p className="text-sm text-emerald-600 font-medium">Profile updated successfully.</p>
                  )}
                  {updateProfile.isError && (
                    <p className="text-sm text-red-500">{updateProfile.error?.error ?? 'Failed to update profile.'}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6 border-b border-emerald-100 pb-4">Account Security</h2>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full border border-emerald-200 rounded-lg px-4 py-2 bg-emerald-50/50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="pt-4">
                  <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full border border-emerald-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-emerald-600 font-medium">{pwSuccess}</p>}
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6 border-b border-emerald-100 pb-4">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { title: 'Course Updates', desc: 'Announcements and updates from instructors.' },
                  { title: 'Promotions & Offers', desc: 'Receive special discounts and promotional offers.' },
                  { title: 'Learning Reminders', desc: 'Weekly reminders to help you reach your goals.' },
                  { title: 'Community Discussions', desc: 'Alerts when someone replies to your forum posts.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-black">{item.title}</h3>
                      <p className="text-sm text-black mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifs[i]}
                        onChange={() => setNotifs(n => n.map((v, idx) => idx === i ? !v : v))}
                      />
                      <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 pt-6 border-t border-emerald-100 flex justify-end">
            <button
              onClick={activeTab === 'account' ? handlePasswordSave : activeTab === 'profile' ? handleProfileSave : undefined}
              disabled={
                (activeTab === 'profile' && (updateProfile.isPending || isLoading)) ||
                (activeTab === 'account' && changePassword.isPending)
              }
              className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium disabled:opacity-60"
            >
              {(updateProfile.isPending || changePassword.isPending)
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />
              }
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
