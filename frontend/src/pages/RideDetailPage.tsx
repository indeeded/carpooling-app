import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  notes: string | null;
  status: string;
  driver: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
}

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: ride, isLoading } = useQuery<Ride>({
    queryKey: ['ride', id],
    queryFn: async () => { const { data } = await api.get(`/rides/${id}`); return data; },
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post(`/rides/${id}/book`),
    onSuccess: () => {
      setMessage({ text: 'Seat booked! Check your dashboard.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ride', id] });
    },
    onError: (err: any) => setMessage({ text: err.response?.data?.message || 'Booking failed', type: 'error' }),
  });

  const waitlistMutation = useMutation({
    mutationFn: () => api.post(`/waitlist/${id}`),
    onSuccess: () => {
      setMessage({ text: "You're on the waitlist. You'll get a seat if one opens up.", type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['ride', id] });
    },
    onError: (err: any) => setMessage({ text: err.response?.data?.message || 'Could not join waitlist', type: 'error' }),
  });

  if (isLoading) return (
    <div className="max-w-xl mx-auto mt-8 space-y-4">
      <div className="card animate-pulse h-48" />
      <div className="card animate-pulse h-24" />
    </div>
  );
  if (!ride) return <p className="text-center text-slate-400 mt-16">Ride not found.</p>;

  const isDriver = user?.id === ride.driver.id;
  const isFull = ride.availableSeats === 0;
  const isPast = new Date(ride.departureAt) < new Date();

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to results
      </button>

      <div className="card mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-1">
              <span>{ride.origin}</span>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>{ride.destination}</span>
            </div>
            <p className="text-slate-500 text-sm">
              {new Date(ride.departureAt).toLocaleString('sl-SI', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`badge ${ride.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            {ride.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Price', value: `€${Number(ride.pricePerSeat).toFixed(2)}`, color: 'text-blue-600' },
            { label: 'Seats left', value: ride.availableSeats, color: isFull ? 'text-red-500' : 'text-green-600' },
            { label: 'Total seats', value: ride.totalSeats, color: 'text-slate-900' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
            {ride.driver.firstName[0]}{ride.driver.lastName[0]}
          </div>
          <div>
            <p className="text-xs text-slate-500">Driver</p>
            <p className="font-medium text-slate-900">{ride.driver.firstName} {ride.driver.lastName}</p>
          </div>
        </div>

        {ride.notes && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
            <p className="text-xs font-medium text-amber-600 mb-1">Notes from driver</p>
            <p className="text-sm text-slate-700">{ride.notes}</p>
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-xl text-sm mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center py-2">
            <p className="text-sm text-slate-500 mb-3">Sign in to book this ride</p>
            <a href="/login" className="btn-primary">Sign in</a>
          </div>
        )}

        {isAuthenticated && !isDriver && user?.role === 'passenger' && (
          isPast ? (
            <div className="text-center py-2 text-sm text-slate-400 bg-slate-50 rounded-xl p-3">
              This ride has already departed
            </div>
          ) : !isFull ? (
            <button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending}
              className="btn-primary w-full text-base py-3">
              {bookMutation.isPending ? 'Booking...' : 'Book seat'}
            </button>
          ) : (
            <button onClick={() => waitlistMutation.mutate()} disabled={waitlistMutation.isPending}
              className="w-full bg-amber-500 text-white py-3 rounded-xl text-base font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
              {waitlistMutation.isPending ? 'Joining...' : 'Join waitlist'}
            </button>
          )
        )}

        {isDriver && (
          <div className="text-center py-2 text-sm text-slate-400">
            This is your ride — manage it from your{' '}
            <a href="/dashboard" className="text-blue-600 hover:underline">dashboard</a>
          </div>
        )}
      </div>
    </div>
  );
}
