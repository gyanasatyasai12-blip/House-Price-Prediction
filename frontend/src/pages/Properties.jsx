import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Database, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Properties() {
  const [data, setData] = useState({ data: [], total: 0, page: 1, total_pages: 1 })
  const [page, setPage] = useState(1)
  useEffect(() => { axios.get('/api/properties', { params: { page, per_page: 20 } }).then(r => setData(r.data)) }, [page])
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Properties</h1>
      <p className="text-gray-400">Historical property data</p>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              {['Location', 'Beds', 'Bath', 'Sqft', 'Year', 'Lot', 'Floors', 'Water', 'Condition', 'Price'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {data.data.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm">{r.location}</td>
                  <td className="px-4 py-3 text-sm">{r.bedrooms}</td>
                  <td className="px-4 py-3 text-sm">{r.bathrooms}</td>
                  <td className="px-4 py-3 text-sm">{r.sqft}</td>
                  <td className="px-4 py-3 text-sm">{r.year_built}</td>
                  <td className="px-4 py-3 text-sm">{r.lot_size}</td>
                  <td className="px-4 py-3 text-sm">{r.floors}</td>
                  <td className="px-4 py-3 text-sm">{r.waterfront ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-sm">{r.condition_grade}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{r.actual_price ? `$${(r.actual_price / 1000).toFixed(0)}K` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <p className="text-sm text-gray-500">Page {data.page} of {data.total_pages} ({data.total} total)</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
