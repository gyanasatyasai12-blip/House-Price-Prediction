import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Home, LayoutDashboard, Database, BarChart3, Calculator } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Predict from './pages/Predict'
import Properties from './pages/Properties'
import Analytics from './pages/Analytics'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/predict', icon: Calculator, label: 'Predict Price' },
  { path: '/properties', icon: Database, label: 'Properties' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      <div className="flex h-screen overflow-hidden">
        <aside className="w-72 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <Home size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">PropValue AI</h1>
                <p className="text-xs text-gray-500">House Price Prediction</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                <item.icon size={18} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
