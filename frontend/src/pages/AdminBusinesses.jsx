import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, IndianRupee, Users, ArrowUpRight } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import ProgressBar from '../components/ui/ProgressBar';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/business');
      setBusinesses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = businesses.filter((b) => {
    const matchesSector = filterSector === 'ALL' || b.sector === filterSector;
    const matchesSearch =
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const sectors = ['ALL', ...new Set(businesses.map((b) => b.sector).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Industrial Enterprises Directory"
        subtitle="Catalog of manufacturing, food processing, engineering, and chemical units registered on SUVIDHA."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Businesses' },
        ]}
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enterprise name, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setFilterSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterSector === sec
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec === 'ALL' ? 'All Sectors' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Enterprise Name & Location</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Investment</th>
                <th className="py-3 px-4">Workforce</th>
                <th className="py-3 px-4">Profile Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <>
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <EmptyState
                      icon={Building2}
                      title="No Enterprises Found"
                      description="No industrial businesses match your current filter."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {b.district || 'Pune'}, {b.state || 'Maharashtra'}
                        </span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {b.sector || 'Food Processing'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      ₹{b.investment ? `${b.investment.toLocaleString('en-IN')}` : '50,00,000'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.workers_count || 25} workers</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 w-44">
                      <ProgressBar
                        value={b.profile_completion || 82}
                        size="sm"
                        showLabel={true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
