import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Payments(){
  const [payments, setPayments] = useState([])
  useEffect(()=>{ api.paymentsGet({ page:1, limit: 50 }).then(r=>setPayments(r.data||[])).catch(()=>{}) },[])
  return (
    <div>
      <h5>Payments</h5>
      <div className="card p-3">
        <table className="table">
          <thead><tr><th>Student</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{payments.map(p=> <tr key={p._id}><td>{p.student_id}</td><td>{p.amount}</td><td>{p.status}</td><td><button className="btn btn-sm btn-outline-success">Mark Paid</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
