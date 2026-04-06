import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.avatarUrl}` : null
  );

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put('/users/me', data),
    onSuccess: (res) => {
      updateUser({ ...user!, ...res.data });
      setMessage('Profile updated.');
    },
    onError: () => setMessage('Update failed.'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return api.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      updateUser({ ...user!, avatarUrl: res.data.avatarUrl });
      setAvatarPreview(`${import.meta.env.VITE_API_URL?.replace('/api', '')}${res.data.avatarUrl}`);
      setMessage('Avatar updated.');
    },
    onError: () => setMessage('Avatar upload failed.'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {message && (
        <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">{message}</p>
      )}

      {/* Avatar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
          <label className="text-sm text-blue-600 hover:underline cursor-pointer">
            {avatarMutation.isPending ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Edit details</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-1">First name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Last name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg capitalize">{user?.role}</p>
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
