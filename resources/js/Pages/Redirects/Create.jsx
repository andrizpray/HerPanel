import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Create({ domainId }) {
  const { data, setData, post, processing, errors } = useForm({
    source_path: '',
    destination_url: '',
    redirect_type: '301',
    is_active: true,
    priority: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/domains/${domainId}/redirects`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Create Redirect Rule</h1>
        <a
          href={`/domains/${domainId}/redirects`}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back
        </a>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Source Path</label>
          <input
            type="text"
            value={data.source_path}
            onChange={(e) => setData('source_path', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
            placeholder="/old-page"
          />
          {errors.source_path && <p className="text-red-400 text-xs mt-1">{errors.source_path}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Destination URL</label>
          <input
            type="text"
            value={data.destination_url}
            onChange={(e) => setData('destination_url', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com/new-page"
          />
          {errors.destination_url && <p className="text-red-400 text-xs mt-1">{errors.destination_url}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Redirect Type</label>
          <select
            value={data.redirect_type}
            onChange={(e) => setData('redirect_type', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="301">301 Permanent</option>
            <option value="302">302 Temporary</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) => setData('is_active', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
          />
          <label className="ml-2 block text-sm text-gray-300">Active</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Priority</label>
          <input
            type="number"
            value={data.priority}
            onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
