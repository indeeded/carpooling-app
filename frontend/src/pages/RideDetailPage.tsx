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
  const [message, setMessage] = useState('');

  const { data: ride, isLoading } = useQuery<Ride>({
    queryKey: ['ride', id],
    queryFn: async () => {
      const { data } = await api.get(`/rides/${id}`);
      return data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post(`/rides/${id}/book`),
    onSuccess: () => {
      setMessage('Booking confirmed! Check your dashboard.');
      queryClient.invalidateQueries({ queryKey: ['ride', id] });
    },
    onError: (err: any) => {
      setMessage(err.response?.data?.message || 'Booking failed');
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: () => api.post(`/waitlist/${id}`),
    onSuccess: () => {
      setMessage("You're on the waitlist. We'll notify you if a seat opens.");
      queryClient.invalidateQueries({ queryKey: ['ride', id] });
    },
    onError: (err: any) => {
      setMessage(err.response?.data?.message || 'Could not join waitlist');
    },
  });

  if (isLoading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (!ride) return <p className="text-gray-400 text-sm">Ride not found.</p>;

  const isDriver = user?.id === ride.driver.id;
  const isFull = ride.availableSeats === 0;

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 text-2xl font-bold mb-1">
          <span>{ride.origin}</span>
          <span className="text-gray-400">→</span>
          <span>{ride.destination}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          {new Date(ride.departureAt).toLocaleString('sl-SI', {
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">€{Number(ride.pricePerSeat).toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">per seat</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{ride.availableSeats}</div>
            <div className="text-xs text-gray-500 mt-1">seats left</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{ride.totalSeats}</div>
            <div className="text-xs text-gray-500 mt-1">total seats</div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-sm text-gray-500">Driver</p>
          <p className="font-medium">{ride.driver.firstName} {ride.driver.lastName}</p>
        </div>

        {ride.notes && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-sm">{ride.notes}</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-gray-500">
            <a href="/login" className="text-blue-600 hover:underline">Sign in</a> to book this ride.
          </p>
        )}

        {isAuthenticated && !isDriver && user?.role === 'passenger' && (
          <div className="flex gap-3">
            {!isFull ? (
              <button
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {bookMutation.isPending ? 'Booking...' : 'Book seat'}
              </button>
            ) : (
              <button
                onClick={() => waitlistMutation.mutate()}
                disabled={waitlistMutation.isPending}
                className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {waitlistMutation.isPending ? 'Joining...' : 'Join waitlist'}
              </button>
            )}
          </div>
        )}

        {isDriver && (
          <p className="text-sm text-gray-400 text-center">This is your ride. Manage it from your dashboard.</p>
        )}
      </div>
    </div>
  );
}
