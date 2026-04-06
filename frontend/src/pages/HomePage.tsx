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
      {/* Hero */}
      <div className="text-center py-14 px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Share the ride,<br />
          <span className="text-blue-600">split the cost</span>
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Find affordable rides between cities or offer your empty seats to fellow commuters.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-2xl p-3 mb-10 flex gap-2 flex-wrap shadow-sm max-w-3xl mx-auto">
        <div className="flex-1 min-w-28">
          <input className="input border-0 bg-slate-50 focus:bg-white" placeholder="From city..."
            value={search.origin} onChange={(e) => setSearch({ ...search, origin: e.target.value })} />
        </div>
        <div className="flex-1 min-w-28">
          <input className="input border-0 bg-slate-50 focus:bg-white" placeholder="To city..."
            value={search.destination} onChange={(e) => setSearch({ ...search, destination: e.target.value })} />
        </div>
        <div>
          <input type="date" className="input border-0 bg-slate-50 focus:bg-white text-slate-600"
            value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary px-8">Search</button>
      </form>

      {/* Results */}
      <div className="max-w-3xl mx-auto">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-48 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-32" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && rides?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="font-semibold text-slate-700 mb-1">No rides found</h3>
            <p className="text-slate-400 text-sm">Try different cities or dates</p>
          </div>
        )}

        <div className="space-y-3">
          {rides?.map((ride) => (
            <Link key={ride.id} to={`/rides/${ride.id}`}
              className="card flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                  {ride.driver.firstName[0]}{ride.driver.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    <span>{ride.origin}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{ride.destination}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>{new Date(ride.departureAt).toLocaleString('sl-SI', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}</span>
                    <span>·</span>
                    <span>{ride.driver.firstName} {ride.driver.lastName}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-xl font-bold text-slate-900">€{Number(ride.pricePerSeat).toFixed(2)}</div>
                <div className={`text-xs mt-1 font-medium badge ${
                  ride.availableSeats === 0
                    ? 'bg-red-50 text-red-500'
                    : 'bg-green-50 text-green-600'
                }`}>
                  {ride.availableSeats === 0 ? 'Full' : `${ride.availableSeats} seat${ride.availableSeats !== 1 ? 's' : ''} left`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
