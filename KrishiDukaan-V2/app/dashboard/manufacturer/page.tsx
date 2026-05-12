'use client'

export default function ManufacturerOverview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Manufacturer Overview</h1>
      <p className="mt-4 text-gray-600">Welcome to your dashboard. Monitor your production and distribution.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Global Reach</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0 Regions</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Active Dealers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Products in Catalog</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
