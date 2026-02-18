'use client';

import { useState, useMemo } from 'react';
import { HomeCloseout } from '@/lib/types';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function PerformancePage() {
  const { data: rawData, loading, error, clearError } =
    useSupabaseTable<HomeCloseout>({ table: 'home_closeouts', orderColumn: 'purchase_date', ascending: false });

  const data = useMemo(() => rawData.filter(r => !r.lot?.startsWith('B')), [rawData]);

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMetrics, setVisibleMetrics] = useState({
    avgDailyFeed: true,
    feedConversion: true,
    avgDailyGain: true,
  });
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const availableGroups = data.filter(record =>
    record.purchase_date &&
    record.lot &&
    (record.ave_feed_intake_per_hd_per_day_deads_out || record.dm_feed_per_gain_deads_out || record.adg_deads_out)
  ).sort((a, b) => new Date(b.purchase_date!).getTime() - new Date(a.purchase_date!).getTime());

  const filteredGroups = availableGroups.filter(record => {
    const s = searchTerm.toLowerCase();
    return (
      record.lot?.toLowerCase().includes(s) ||
      record.origin?.toLowerCase().includes(s)
    );
  });

  const toggleGroup = (id: number) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedGroups(filteredGroups.map(g => g.id));
  const selectNone = () => setSelectedGroups([]);
  const selectRecent5 = () => setSelectedGroups(availableGroups.slice(0, 5).map(g => g.id));
  const selectRecent10 = () => setSelectedGroups(availableGroups.slice(0, 10).map(g => g.id));
  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  const selectedData = availableGroups.filter(g => selectedGroups.includes(g.id));
  const sortedSelectedData = [...selectedData].sort((a, b) => new Date(a.purchase_date!).getTime() - new Date(b.purchase_date!).getTime());

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const datasets: Array<{
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    yAxisID: string;
  }> = [];

  if (visibleMetrics.avgDailyFeed) {
    datasets.push({
      label: 'Avg Daily Feed (lbs)',
      data: sortedSelectedData.map(g => g.ave_feed_intake_per_hd_per_day_deads_out),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      tension: 0.1,
      yAxisID: 'y',
    });
  }
  if (visibleMetrics.feedConversion) {
    datasets.push({
      label: 'Feed Conversion',
      data: sortedSelectedData.map(g => g.dm_feed_per_gain_deads_out),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.7)',
      tension: 0.1,
      yAxisID: 'y',
    });
  }
  if (visibleMetrics.avgDailyGain) {
    datasets.push({
      label: 'Avg Daily Gain (lbs)',
      data: sortedSelectedData.map(g => g.adg_deads_out),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
      tension: 0.1,
      yAxisID: 'y1',
    });
  }

  const chartData = {
    labels: sortedSelectedData.map(g => g.lot),
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Group Performance Comparison' },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Feed / Conversion' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Daily Gain (lbs)' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Performance Charts
          </h2>
          <div className="text-sm text-gray-500">
            {selectedGroups.length} of {availableGroups.length} groups selected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold">Select Groups</h3>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={selectAll} className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Select All</button>
              <button onClick={selectNone} className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Select None</button>
              <button onClick={selectRecent5} className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Recent 5</button>
              <button onClick={selectRecent10} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Recent 10</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No groups with performance data found</div>
            ) : (
              filteredGroups.map(group => (
                <label
                  key={group.id}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b ${selectedGroups.includes(group.id) ? 'bg-blue-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{group.lot}</div>
                    <div className="text-xs text-gray-500">{formatDate(group.purchase_date)} &bull; {group.origin || 'No origin'}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          {selectedGroups.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Select groups from the list to view performance chart
            </div>
          ) : (
            <div>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={visibleMetrics.avgDailyFeed} onChange={() => toggleMetric('avgDailyFeed')} className="w-4 h-4 rounded" />
                      <span className="text-sm flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Avg Daily Feed
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={visibleMetrics.feedConversion} onChange={() => toggleMetric('feedConversion')} className="w-4 h-4 rounded" />
                      <span className="text-sm flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        Feed Conversion
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={visibleMetrics.avgDailyGain} onChange={() => toggleMetric('avgDailyGain')} className="w-4 h-4 rounded" />
                      <span className="text-sm flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Avg Daily Gain
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Bar Chart
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 text-xs rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Line Chart
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-96 p-4">
                <Chart type={chartType} data={chartData as any} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      </div>

      {sortedSelectedData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold">Selected Groups Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Daily Feed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Feed Conversion</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Daily Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedSelectedData.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{group.lot}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(group.purchase_date)}</td>
                    <td className="px-4 py-3 text-sm">{group.origin || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{group.ave_feed_intake_per_hd_per_day_deads_out?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{group.dm_feed_per_gain_deads_out?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{group.adg_deads_out?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
