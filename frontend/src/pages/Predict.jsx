import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calculator, DollarSign } from 'lucide-react'

export default function Predict() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ location: 'Suburb', bedrooms: 3, bathrooms: 2, sqft: 2000, year_built: 2000, lot_size: 0.5, floors: 1, waterfront: 0, condition_grade: 6 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { axios.get('/api/filters').then(r => setLocations(r.data.locations || [])) }, [])

  const handlePredict = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.post('/api/predict', form)
      .then(r => { setResult(r.data); setLoading(false); toast.success('Prediction ready!') })
      .catch(() => { setLoading(false); toast.error('Prediction failed') })
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Predict Price</h1>
      <p className="text-gray-400">Enter property details for ML-powered price estimation</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handlePredict} className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Calculator size={20} /> Property Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500">
                {locations.length ? locations.map(l => <option key={l} value={l}>{l}</option>) : <option>Suburb</option>}
              </select>
            </div>
            <div><label className="block text-sm text-gray-400 mb-1">Bedrooms</label><input type="number" min="1" max="10" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Bathrooms</label><input type="number" min="0.5" step="0.5" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Sqft</label><input type="number" min="500" value={form.sqft} onChange={e => setForm({ ...form, sqft: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Year Built</label><input type="number" min="1900" max="2024" value={form.year_built} onChange={e => setForm({ ...form, year_built: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Lot Size (acres)</label><input type="number" min="0.1" step="0.1" value={form.lot_size} onChange={e => setForm({ ...form, lot_size: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Floors</label><input type="number" min="1" max="5" value={form.floors} onChange={e => setForm({ ...form, floors: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Condition (1-10)</label><input type="number" min="1" max="10" value={form.condition_grade} onChange={e => setForm({ ...form, condition_grade: +e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={form.waterfront === 1} onChange={e => setForm({ ...form, waterfront: e.target.checked ? 1 : 0 })} className="rounded" />
              <span className="text-sm text-gray-400">Waterfront</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Calculator size={18} />}
            {loading ? 'Predicting...' : 'Get Price Estimate'}
          </button>
        </form>
        {result && (
          <div className="glass-card p-8 flex flex-col items-center justify-center">
            <DollarSign size={48} className="text-emerald-400 mb-4" />
            <p className="text-gray-400 mb-1">Estimated Price</p>
            <p className="text-4xl font-bold text-emerald-400">${(result.predicted_price / 1000).toFixed(0)}K</p>
            <p className="text-sm text-gray-500 mt-2">Range: ${(result.confidence_lower / 1000).toFixed(0)}K - ${(result.confidence_upper / 1000).toFixed(0)}K</p>
            <p className="text-xs text-gray-500 mt-4">Model: {result.model_used}</p>
          </div>
        )}
      </div>
    </div>
  )
}
