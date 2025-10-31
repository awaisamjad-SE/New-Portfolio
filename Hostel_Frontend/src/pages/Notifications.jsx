import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications(){
  const [logs, setLogs] = useState([])
  useEffect(()=>{ api.notificationsLogs({ page:1, limit:50 }).then(r=>setLogs(r.data||[])).catch(()=>{}) },[])
  return (
    <div>
      <h5>Notifications</h5>
      <div className="card p-3">
        <table className="table">
          <thead><tr><th>Time</th><th>Type</th><th>Status</th><th>Message</th></tr></thead>
          <tbody>{logs.map(l=> <tr key={l._id}><td>{l.createdAt}</td><td>{l.type}</td><td>{l.status}</td><td>{l.message}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
