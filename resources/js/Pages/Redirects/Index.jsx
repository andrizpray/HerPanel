import React from 'react';

export default function Index({ domainId, redirectRules }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Redirect Rules — Domain #{domainId}</h1>
      <p className="text-gray-300">Total rules: {redirectRules.length}</p>
      <a href={`/domains/${domainId}/redirects/create`} className="text-blue-400">Create Redirect</a>
    </div>
  );
}
