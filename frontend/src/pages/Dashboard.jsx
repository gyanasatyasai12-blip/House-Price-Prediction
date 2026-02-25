import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Home, DollarSign, MapPin, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { axios.get('/api/dashboard').then(r => setData(r.data)) }, [])
  if (!data) return <div className="flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-400">Property insights and price overview</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex justify-between"><span className="text-gray-400">Total Properties</span><Home size={20} className="text-emerald-400" /></div>
          <p className="text-2xl font-bold mt-2">{data.total_properties}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between"><span className="text-gray-400">Avg Price</span><DollarSign size={20} className="text-cyan-400" /></div>
          <p className="text-2xl font-bold mt-2">${(data.avg_price / 1000).toFixed(0)}K</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between"><span className="text-gray-400">Locations</span><MapPin size={20} className="text-purple-400" /></div>
          <p className="text-2xl font-bold mt-2">{data.by_location?.length || 0}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between"><span className="text-gray-400">Recent Predictions</span><TrendingUp size={20} className="text-yellow-400" /></div>
          <p className="text-2xl font-bold mt-2">{data.recent_predictions?.length || 0}</p>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Price by Location</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.by_location?.map(l => (
            <div key={l.location} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <p className="text-sm text-gray-400">{l.location}</p>
              <p className="text-lg font-bold text-emerald-400">${l.avg ? (l.avg / 1000).toFixed(0) + 'K' : '-'}</p>
              <p className="text-xs text-gray-500">{l.c} properties</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800"><th className="text-left py-3 text-gray-400">Location</th><th className="text-left py-3 text-gray-400">Beds</th><th className="text-left py-3 text-gray-400">Sqft</th><th className="text-left py-3 text-gray-400">Predicted</th></tr></thead>
            <tbody>
              {data.recent_predictions?.slice(0, 8).map(r => (
                <tr key={r.id} className="border-b border-gray-800/50"><td className="py-3">{r.location}</td><td className="py-3">{r.bedrooms}</td><td className="py-3">{r.sqft}</td><td className="py-3 font-semibold text-emerald-400">${(r.predicted_price / 1000).toFixed(0)}K</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
