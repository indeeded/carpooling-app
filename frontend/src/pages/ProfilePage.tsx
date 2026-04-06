import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatarUrl}` : null
  );

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put('/users/me', data),
    onSuccess: (res) => {
      updateUser({ ...user!, ...res.data });
      setMessage({ text: 'Profile updated successfully.', type: 'success' });
    },
    onError: () => setMessage({ text: 'Update failed. Try again.', type: 'error' }),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      updateUser({ ...user!, avatarUrl: res.data.avatarUrl });
      setAvatarPreview(`${import.meta.env.VITE_API_URL?.replace('/api', '')}${res.data.avatarUrl}`);
      setMessage({ text: 'Photo updated.', type: 'success' });
    },
    onError: () => setMessage({ text: 'Upload failed. Max 2MB, JPEG/PNG only.', type: 'error' }),
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm mb-4 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-100 text-green-700'
            : 'bg-red-50 border border-red-100 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Avatar card */}
      <div className="card flex items-center gap-5 mb-4">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role}</p>
          <label className="inline-block mt-2 text-sm text-blue-600 hover:underline cursor-pointer font-medium">
            {avatarMutation.isPending ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) avatarMutation.mutate(f); }} />
          </label>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-5">Edit details</h2>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
            <input className="input" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
            <input className="input" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input className="input bg-slate-50 text-slate-500" value={user?.email} disabled />
          </div>
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary w-full">
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
