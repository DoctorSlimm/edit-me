'use client';

import { useState } from 'react';
import type { TreeCreateInput } from '@/lib/trees';

interface ImportResult {
  message: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: {
    successful: any[];
    failed: Array<{ input: TreeCreateInput; error: string }>;
  };
}

export default function TreeBulkImport({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [csvText, setCsvText] = useState('');

  const parseCSV = (csv: string): TreeCreateInput[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const trees: TreeCreateInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length !== headers.length) continue;

      const tree: any = {};
      headers.forEach((header, idx) => {
        if (['latitude', 'longitude'].includes(header)) {
          tree[header] = parseFloat(values[idx]);
        } else {
          tree[header] = values[idx];
        }
      });

      if (tree.species && tree.planting_date && tree.latitude !== undefined && tree.longitude !== undefined && tree.health_status) {
        trees.push(tree as TreeCreateInput);
      }
    }

    return trees;
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
    setError('');
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setError('');
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!csvText.trim()) {
      setError('Please enter CSV data or upload a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const trees = parseCSV(csvText);

      if (trees.length === 0) {
        setError('No valid tree records found in CSV. Expected columns: species, planting_date, latitude, longitude, health_status');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/trees/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trees }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to import trees');
        setLoading(false);
        return;
      }

      setResult(data);
      setCsvText('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to process import. Please check the CSV format.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Bulk Import Trees</h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Format</h3>
        <p className="text-sm text-blue-700 mb-2">Expected columns (comma-separated):</p>
        <code className="text-xs bg-white p-2 block rounded border border-blue-100 font-mono">
          species, planting_date, latitude, longitude, health_status
        </code>
        <p className="text-xs text-blue-600 mt-2">Example:</p>
        <code className="text-xs bg-white p-2 block rounded border border-blue-100 font-mono mt-1">
          Oak, 2023-01-15, 40.7128, -74.0060, healthy
        </code>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-900 mb-3">Import Summary</h3>
          <p className="text-sm text-green-700 mb-2">{result.message}</p>
          <div className="grid grid-cols-3 gap-2 text-sm text-green-700 mb-3">
            <div>Total: {result.summary.total}</div>
            <div>Successful: {result.summary.successful}</div>
            <div>Failed: {result.summary.failed}</div>
          </div>

          {result.results.failed.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <h4 className="text-sm font-medium text-red-700 mb-2">Failed Records:</h4>
              <ul className="text-xs text-red-600 space-y-1">
                {result.results.failed.map((item, idx) => (
                  <li key={idx}>
                    {item.input.species} ({item.input.planting_date}): {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or paste CSV data</span>
          </div>
        </div>

        <div>
          <label htmlFor="csv-input" className="block text-sm font-medium text-gray-700 mb-2">
            CSV Data
          </label>
          <textarea
            id="csv-input"
            value={csvText}
            onChange={handleCSVChange}
            placeholder="species, planting_date, latitude, longitude, health_status&#10;Oak, 2023-01-15, 40.7128, -74.0060, healthy"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !csvText.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Importing Trees...' : 'Import Trees'}
        </button>
      </div>
    </div>
  );
}
