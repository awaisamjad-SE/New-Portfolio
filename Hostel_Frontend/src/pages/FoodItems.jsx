import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function FoodItems(){
  const [items, setItems] = useState([])
  useEffect(()=>{ api.foodGet().then(r=>setItems(r.data||[])).catch(()=>{}) },[])
  return (
    <div>
      <h5>Food Items</h5>
      <div className="card p-3">
        <table className="table">
          <thead><tr><th>Name</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(f=> <tr key={f._id}><td>{f.name}</td><td>{f.price}</td><td><button className="btn btn-sm btn-outline-secondary">Edit</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
