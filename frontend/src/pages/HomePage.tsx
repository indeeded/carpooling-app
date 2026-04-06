import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  availableSeats: number;
  pricePerSeat: number;
  driver: { firstName: string; lastName: string; avatarUrl: string | null };
}

export default function HomePage() {
  const [search, setSearch] = useState({ origin: '', destination: '', date: '' });
  const [query, setQuery] = useState({});

  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: ['rides', query],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(query).filter(([, v]) => v))
      );
      const { data } = await api.get(`/rides?${params}`);
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...search });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a ride</h1>
        <p className="text-gray-500 text-sm">Share the journey, split the cost.</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-xl p-4 mb-8 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="From"
          className="flex-1 min-w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search.origin}
          onChange={(e) => setSearch({ ...search, origin: e.target.value })}
        />
        <input
          type="text"
          placeholder="To"
          className="flex-1 min-w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search.destination}
          onChange={(e) => setSearch({ ...search, destination: e.target.value })}
        />
        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {isLoading && <p className="text-gray-400 text-sm">Loading rides...</p>}

      {rides && rides.length === 0 && (
        <p className="text-gray-400 text-sm">No rides found. Try different search terms.</p>
      )}

      <div className="space-y-3">
        {rides?.map((ride) => (
          <Link
            key={ride.id}
            to={`/rides/${ride.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span>{ride.origin}</span>
                  <span className="text-gray-400">→</span>
                  <span>{ride.destination}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(ride.departureAt).toLocaleString('sl-SI', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Driver: {ride.driver.firstName} {ride.driver.lastName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">€{Number(ride.pricePerSeat).toFixed(2)}</div>
                <div className={`text-xs mt-1 font-medium ${ride.availableSeats === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {ride.availableSeats === 0 ? 'Full' : `${ride.availableSeats} seat${ride.availableSeats !== 1 ? 's' : ''} left`}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
