import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Booking {
  id: string;
  status: string;
  bookedAt: string;
  ride: {
    id: string; origin: string; destination: string;
    departureAt: string; pricePerSeat: number;
    driver: { firstName: string; lastName: string };
  };
}

interface WaitlistEntry {
  id: string;
  position: number;
  status: string;
  ride: {
    id: string; origin: string; destination: string;
    departureAt: string;
    driver: { firstName: string; lastName: string };
  };
}

interface Ride {
  id: string; origin: string; destination: string;
  departureAt: string; availableSeats: number; totalSeats: number; status: string;
  bookings: { id: string; status: string; passenger: { firstName: string; lastName: string } }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'driver';

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => { const { data } = await api.get('/bookings/me'); return data; },
    enabled: !isDriver,
  });

  const { data: waitlistEntries } = useQuery<WaitlistEntry[]>({
    queryKey: ['my-waitlist'],
    queryFn: async () => { const { data } = await api.get('/waitlist/me'); return data; },
    enabled: !isDriver,
  });

  const { data: myRides } = useQuery<Ride[]>({
    queryKey: ['my-rides'],
    queryFn: async () => { const { data } = await api.get('/rides/driver/me'); return data; },
    enabled: isDriver,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  const cancelRideMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/rides/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-rides'] }),
  });

  const leaveWaitlistMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/waitlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-waitlist'] }),
  });

  const formatDate = (d: string) => new Date(d).toLocaleString('sl-SI', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.firstName}</p>
        </div>
        {isDriver && (
          <Link to="/rides/new" className="btn-primary">+ Post a ride</Link>
        )}
      </div>

      {/* Passenger view */}
      {!isDriver && (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My bookings</h2>
            {!bookings?.length ? (
              <div className="card text-center py-10">
                <div className="text-4xl mb-3">🎫</div>
                <p className="font-medium text-slate-700 mb-1">No bookings yet</p>
                <p className="text-slate-400 text-sm mb-4">Find a ride to get started</p>
                <Link to="/" className="btn-primary inline-block">Browse rides</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {booking.ride.origin[0]}{booking.ride.destination[0]}
                      </div>
                      <div>
                        <Link to={`/rides/${booking.ride.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {booking.ride.origin} → {booking.ride.destination}
                        </Link>
                        <p className="text-sm text-slate-500">{formatDate(booking.ride.departureAt)}</p>
                        <p className="text-sm font-medium text-blue-600">€{Number(booking.ride.pricePerSeat).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className={`badge ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {booking.status}
                      </span>
                      {booking.status === 'confirmed' && (
                        <button onClick={() => cancelBookingMutation.mutate(booking.id)}
                          disabled={cancelBookingMutation.isPending}
                          className="btn-danger block mt-2 ml-auto">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My waitlist</h2>
            {!waitlistEntries?.length ? (
              <p className="text-slate-400 text-sm">You are not on any waitlists.</p>
            ) : (
              <div className="space-y-3">
                {waitlistEntries.map((entry) => (
                  <div key={entry.id} className="card flex items-center justify-between border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                        #{entry.position}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.ride.origin} → {entry.ride.destination}
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(entry.ride.departureAt)}</p>
                        <p className="text-xs text-amber-600 font-medium mt-0.5">Position #{entry.position} in queue</p>
                      </div>
                    </div>
                    <button onClick={() => leaveWaitlistMutation.mutate(entry.id)}
                      disabled={leaveWaitlistMutation.isPending}
                      className="btn-danger flex-shrink-0 ml-4">
                      Leave
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Driver view */}
      {isDriver && (
        <section>
          {!myRides?.length ? (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">🚗</div>
              <p className="font-medium text-slate-700 mb-1">No rides posted yet</p>
              <p className="text-slate-400 text-sm mb-4">Share your journey with others</p>
              <Link to="/rides/new" className="btn-primary inline-block">Post your first ride</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRides.map((ride) => (
                <div key={ride.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link to={`/rides/${ride.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-lg">
                        {ride.origin} → {ride.destination}
                      </Link>
                      <p className="text-sm text-slate-500 mt-0.5">{formatDate(ride.departureAt)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`badge ${ride.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {ride.status}
                        </span>
                        <span className="text-sm text-slate-500">
                          {ride.totalSeats - ride.availableSeats}/{ride.totalSeats} booked
                        </span>
                      </div>
                    </div>
                    {ride.status === 'active' && (
                      <button onClick={() => cancelRideMutation.mutate(ride.id)}
                        disabled={cancelRideMutation.isPending}
                        className="btn-danger flex-shrink-0">
                        Cancel ride
                      </button>
                    )}
                  </div>

                  {ride.bookings.filter(b => b.status === 'confirmed').length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-500 mb-2">Passengers</p>
                      <div className="flex flex-wrap gap-2">
                        {ride.bookings.filter(b => b.status === 'confirmed').map((b) => (
                          <span key={b.id}
                            className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                              {b.passenger.firstName[0]}
                            </span>
                            {b.passenger.firstName} {b.passenger.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
