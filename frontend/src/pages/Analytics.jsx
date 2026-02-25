import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
export default function Analytics() {
  const [data, setData] = useState(null)
  useEffect(() => { axios.get('/api/analytics').then(r => setData(r.data)) }, [])
  if (!data) return <div className="flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="text-gray-400">Price trends and distributions</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Avg Price by Bedrooms</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.by_bedrooms || []}><XAxis dataKey="bedrooms" stroke="#6b7280" /><YAxis stroke="#6b7280" tickFormatter={v => `$${v/1000}K`} /><Tooltip formatter={v => [`$${(v/1000).toFixed(0)}K`, 'Avg Price']} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} /><Bar dataKey="avg" fill="#10b981" radius={[6,6,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={data.price_distribution || []} nameKey="bucket" dataKey="c" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>{(data.price_distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Avg Price by Year Built</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(data.by_year || []).slice(-20)}><XAxis dataKey="year_built" stroke="#6b7280" /><YAxis stroke="#6b7280" tickFormatter={v => `$${v/1000}K`} /><Tooltip formatter={v => [`$${(v/1000).toFixed(0)}K`, 'Avg']} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} /><Bar dataKey="avg" fill="#06b6d4" radius={[6,6,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
