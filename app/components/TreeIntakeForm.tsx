'use client';

import { useState } from 'react';
import type { TreeCreateInput } from '@/lib/trees';

interface FormErrors {
  [key: string]: string;
}

export default function TreeIntakeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<TreeCreateInput>({
    species: '',
    planting_date: new Date().toISOString().split('T')[0],
    latitude: 0,
    longitude: 0,
    health_status: 'healthy',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'planting_date' ? value : ['latitude', 'longitude'].includes(name) ? parseFloat(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const newErrors: FormErrors = {};
          data.details.forEach((error: string, index: number) => {
            newErrors[`error_${index}`] = error;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || 'Failed to add tree' });
        }
        return;
      }

      setSuccessMessage(data.message || 'Tree successfully added!');
      setFormData({
        species: '',
        planting_date: new Date().toISOString().split('T')[0],
        latitude: 0,
        longitude: 0,
        health_status: 'healthy',
      });

      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: 'Failed to add tree. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Tree</h2>

      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-900 mb-2">Validation Errors</h3>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            {Object.values(errors).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
            Tree Species *
          </label>
          <input
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            placeholder="e.g., Oak, Maple, Pine"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="planting_date" className="block text-sm font-medium text-gray-700 mb-2">
            Planting Date *
          </label>
          <input
            type="date"
            id="planting_date"
            name="planting_date"
            value={formData.planting_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
              Latitude *
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="-90 to 90"
              min="-90"
              max="90"
              step="0.000001"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
              Longitude *
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="-180 to 180"
              min="-180"
              max="180"
              step="0.000001"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="health_status" className="block text-sm font-medium text-gray-700 mb-2">
            Health Status *
          </label>
          <select
            id="health_status"
            name="health_status"
            value={formData.health_status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="healthy">Healthy</option>
            <option value="diseased">Diseased</option>
            <option value="dead">Dead</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Adding Tree...' : 'Add Tree to Inventory'}
        </button>
      </form>
    </div>
  );
}
