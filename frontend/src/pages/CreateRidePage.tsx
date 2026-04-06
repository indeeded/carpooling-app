import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

export default function CreateRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: '', destination: '', departureAt: '',
    totalSeats: 2, pricePerSeat: 5, notes: '',
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
    mutation.mutate({ ...form, departureAt: new Date(form.departureAt).toISOString() });
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Post a ride</h1>
        <p className="text-slate-500 text-sm mt-1">Share your journey and split the cost</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">From</label>
            <input required className="input" placeholder="Ljubljana"
              value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
            <input required className="input" placeholder="Maribor"
              value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Departure</label>
          <input type="datetime-local" required className="input"
            value={form.departureAt} onChange={(e) => setForm({ ...form, departureAt: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Seats to offer</label>
            <input type="number" min={1} max={8} required className="input"
              value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per seat (€)</label>
            <input type="number" min={0} step={0.5} required className="input"
              value={form.pricePerSeat} onChange={(e) => setForm({ ...form, pricePerSeat: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea rows={3} className="input resize-none"
            placeholder="e.g. Luggage space available, no smoking, pets welcome..."
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3 text-base">
          {mutation.isPending ? 'Posting ride...' : 'Post ride'}
        </button>
      </form>
    </div>
  );
}
