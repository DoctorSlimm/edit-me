'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Tree } from '@/lib/trees';

type SortField = 'species' | 'planting_date' | 'health_status' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface Filters {
  species: string;
  health_status: string;
}

export default function TreeInventoryTable({ refresh }: { refresh?: boolean }) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Filters>({ species: '', health_status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchTrees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/trees');
      if (!response.ok) throw new Error('Failed to fetch trees');
      const data = await response.json();
      setTrees(data.trees || []);
    } catch (err) {
      setError('Failed to load tree inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, [refresh]);

  const uniqueSpecies = useMemo(() => {
    return Array.from(new Set(trees.map((t) => t.species))).sort();
  }, [trees]);

  const filteredAndSortedTrees = useMemo(() => {
    let filtered = trees.filter((tree) => {
      const speciesMatch = !filters.species || tree.species.toLowerCase().includes(filters.species.toLowerCase());
      const healthMatch = !filters.health_status || tree.health_status === filters.health_status;
      return speciesMatch && healthMatch;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [trees, filters, sortField, sortDirection]);

  const paginatedTrees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTrees.slice(start, start + pageSize);
  }, [filteredAndSortedTrees, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTrees.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tree record?')) return;

    try {
      const response = await fetch(`/api/trees/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete tree');
      await fetchTrees();
    } catch (err) {
      setError('Failed to delete tree');
      console.error(err);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'diseased':
        return 'bg-yellow-100 text-yellow-800';
      case 'dead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading && trees.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
        <p className="text-center text-gray-500">Loading tree inventory...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Tree Inventory</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Species</label>
          <select
            value={filters.species}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, species: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Species</option>
            {uniqueSpecies.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Health Status</label>
          <select
            value={filters.health_status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, health_status: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="diseased">Diseased</option>
            <option value="dead">Dead</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th
                onClick={() => handleSort('species')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200"
              >
                Species <SortIcon field="species" />
              </th>
              <th
                onClick={() => handleSort('planting_date')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200"
              >
                Planting Date <SortIcon field="planting_date" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
              <th
                onClick={() => handleSort('health_status')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200"
              >
                Status <SortIcon field="health_status" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrees.map((tree) => (
              <tr key={tree.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{tree.species}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(tree.planting_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {tree.latitude.toFixed(4)}°, {tree.longitude.toFixed(4)}°
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(tree.health_status)}`}>
                    {tree.health_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(tree.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedTrees.length === 0 && (
          <div className="w-full text-center py-8 text-gray-500">
            {trees.length === 0 ? 'No trees in inventory yet. Add one using the form above.' : 'No trees match the selected filters.'}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {paginatedTrees.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredAndSortedTrees.length)} of {filteredAndSortedTrees.length} trees
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
