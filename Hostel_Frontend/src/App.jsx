import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import FoodItems from './pages/FoodItems'
import DailyMeals from './pages/DailyMeals'
import Payments from './pages/Payments'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import api, { setToken, setStudentToken } from './services/api'

export default function App(){
  const [role, setRole] = useState(null)
  const [token, setLocalToken] = useState(null)

  useEffect(()=>{
    if(token){ setToken(token); }
  },[token])

  // Minimal routing; real app should use proper auth flow
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <NavBar role={role} setRole={setRole} />
          <div className="container-fluid fade-slide-in">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/fooditems" element={<FoodItems />} />
              <Route path="/dailymeals" element={<DailyMeals />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
