import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Students(){
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)

  useEffect(()=>{
    const load = async ()=>{
      const res = await api.studentsGet({ page, limit: 20 })
      setStudents(res.data || [])
    }
    load()
  },[page])

  return (
    <div>
      <h5>Students</h5>
      <div className="card p-3">
        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Actions</th></tr></thead>
          <tbody>
            {students.map(s=> (
              <tr key={s._id}><td>{s.student_id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.department}</td><td><button className="btn btn-sm btn-outline-primary">View</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
