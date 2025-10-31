import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function DailyMeals(){
  const [meals, setMeals] = useState([])
  useEffect(()=>{ api.dailyMealsGet({ page:1, limit: 50 }).then(r=>setMeals(r.data || [])).catch(()=>{}) },[])
  return (
    <div>
      <h5>Daily Meals</h5>
      <div className="card p-3">
        <table className="table">
          <thead><tr><th>Date</th><th>Student</th><th>Food</th><th>Qty</th><th>Actions</th></tr></thead>
          <tbody>{meals.map(m=> <tr key={m._id}><td>{m.date}</td><td>{m.student_id}</td><td>{m.food_name}</td><td>{m.quantity}</td><td><button className="btn btn-sm btn-outline-danger">Delete</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
