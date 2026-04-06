import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Booking {
  id: string;
  status: string;
  bookedAt: string;
  ride: {
    id: string;
    origin: string;
    destination: string;
    departureAt: string;
    pricePerSeat: number;
    driver: { firstName: string; lastName: string };
  };
}

interface WaitlistEntry {
  id: string;
  position: number;
  status: string;
  ride: {
    id: string;
    origin: string;
    destination: string;
    departureAt: string;
    driver: { firstName: string; lastName: string };
  };
}

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  availableSeats: number;
  totalSeats: number;
  status: string;
  bookings: { id: string; status: string; passenger: { firstName: string; lastName: string } }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'driver';

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/me');
      return data;
    },
    enabled: !isDriver,
  });

  const { data: myRides } = useQuery<Ride[]>({
    queryKey: ['my-rides'],
    queryFn: async () => {
      const { data } = await api.get('/rides/driver/me');
      return data;
    },
    enabled: isDriver,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => api.delete(`/bookings/${bookingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  const cancelRideMutation = useMutation({
    mutationFn: (rideId: string) => api.delete(`/rides/${rideId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-rides'] }),
  });

  const { data: waitlistEntries } = useQuery<WaitlistEntry[]>({
  queryKey: ['my-waitlist'],
  queryFn: async () => {
    const { data } = await api.get('/waitlist/me');
    return data;
  },
  enabled: !isDriver,
  });

  const leaveWaitlistMutation = useMutation({
  mutationFn: (entryId: string) => api.delete(`/waitlist/${entryId}`),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-waitlist'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Passenger view */}
      {!isDriver && (
        <div>
          <h2 className="text-lg font-semibold mb-4">My bookings</h2>
          {!bookings?.length && (
            <p className="text-gray-400 text-sm">No bookings yet. <Link to="/" className="text-blue-600 hover:underline">Find a ride</Link></p>
          )}
          <div className="space-y-3">
            {bookings?.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/rides/${booking.ride.id}`} className="font-semibold hover:text-blue-600">
                      {booking.ride.origin} → {booking.ride.destination}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(booking.ride.departureAt).toLocaleString('sl-SI', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Driver: {booking.ride.driver.firstName} {booking.ride.driver.lastName}</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">€{Number(booking.ride.pricePerSeat).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => cancelMutation.mutate(booking.id)}
                        disabled={cancelMutation.isPending}
                        className="block mt-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waitlist */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">My waitlist</h2>
        {!waitlistEntries?.length && (
          <p className="text-gray-400 text-sm">You are not on any waitlists.</p>
        )}
        <div className="space-y-3">
          {waitlistEntries?.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {entry.ride.origin} → {entry.ride.destination}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(entry.ride.departureAt).toLocaleString('sl-SI', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    Driver: {entry.ride.driver.firstName} {entry.ride.driver.lastName}
                  </p>
                  <p className="text-sm text-amber-600 font-medium mt-1">
                    Position #{entry.position} in queue
                  </p>
                </div>
                <button
                  onClick={() => leaveWaitlistMutation.mutate(entry.id)}
                  disabled={leaveWaitlistMutation.isPending}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Leave waitlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver view */}
      {isDriver && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My rides</h2>
            <Link to="/rides/new" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
              + Post a ride
            </Link>
          </div>
          {!myRides?.length && (
            <p className="text-gray-400 text-sm">No rides posted yet.</p>
          )}
          <div className="space-y-4">
            {myRides?.map((ride) => (
              <div key={ride.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/rides/${ride.id}`} className="font-semibold hover:text-blue-600">
                      {ride.origin} → {ride.destination}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(ride.departureAt).toLocaleString('sl-SI', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{ride.availableSeats}/{ride.totalSeats} seats available</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      ride.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ride.status}
                    </span>
                    {ride.status === 'active' && (
                      <button
                        onClick={() => cancelRideMutation.mutate(ride.id)}
                        disabled={cancelRideMutation.isPending}
                        className="block mt-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 ml-auto"
                      >
                        Cancel ride
                      </button>
                    )}
                  </div>
                </div>
                {ride.bookings.filter(b => b.status === 'confirmed').length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-2">Passengers</p>
                    <div className="flex flex-wrap gap-2">
                      {ride.bookings
                        .filter((b) => b.status === 'confirmed')
                        .map((b) => (
                          <span key={b.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {b.passenger.firstName} {b.passenger.lastName}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
