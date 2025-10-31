import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="sidebar p-3 d-none d-md-block">
      <h5 className="text-white">Admin</h5>
      <ul className="nav flex-column">
        <li className="nav-item"><NavLink className="nav-link text-white" to="/dashboard">Dashboard</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/students">Students</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/fooditems">Food Items</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/dailymeals">Daily Meals</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/payments">Payments</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/notifications">Notifications</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link text-white" to="/settings">Settings</NavLink></li>
      </ul>
    </aside>
  )
}
