import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

export default function CreateRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    departureAt: '',
    totalSeats: 1,
    pricePerSeat: 0,
    notes: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/rides', data),
    onSuccess: (res) => navigate(`/rides/${res.data.id}`),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create ride'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      ...form,
      departureAt: new Date(form.departureAt).toISOString(),
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Post a ride</h1>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">From</label>
            <input
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">To</label>
            <input
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Departure date & time</label>
          <input
            type="datetime-local"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.departureAt}
            onChange={(e) => setForm({ ...form, departureAt: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Seats available</label>
            <input
              type="number"
              min={1}
              max={8}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.totalSeats}
              onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Price per seat (€)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.pricePerSeat}
              onChange={(e) => setForm({ ...form, pricePerSeat: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. luggage space available, no smoking..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Posting...' : 'Post ride'}
        </button>
      </form>
    </div>
  );
}
