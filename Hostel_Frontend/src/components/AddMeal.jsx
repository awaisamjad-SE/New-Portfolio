import React, { useState, useEffect } from 'react'
import api from '../services/api'
import QRScanner from './QRScanner'

export default function AddMeal(){
  const [mode, setMode] = useState('qr')
  const [studentId, setStudentId] = useState('')
  const [foods, setFoods] = useState([])
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(()=>{ api.foodGet().then(r=>setFoods(r.data || [])).catch(()=>{}) },[])

  const validateStudent = async (id)=>{
    try{
      const res = await api.studentGetById(id)
      return res.data
    }catch(e){
      return null
    }
  }

  const handleAdd = async ()=>{
    const student = await validateStudent(studentId)
    if(!student){ alert('Student not found'); return }
    const payload = { student_id: studentId, food_id: selected?._id, quantity: qty }
    await api.addDailyMeal(payload)
    alert('Meal added')
  }

  return (
    <div className="card card-quiet mb-3 p-3">
      <div className="d-flex justify-content-between mb-2">
        <h6 className="mb-0">Add Meal</h6>
        <div>
          <button className={`btn btn-sm ${mode==='qr'? 'btn-primary':'btn-outline-primary'} me-1`} onClick={()=>setMode('qr')}>Scan QR</button>
          <button className={`btn btn-sm ${mode==='manual'? 'btn-primary':'btn-outline-primary'}`} onClick={()=>setMode('manual')}>Manual</button>
        </div>
      </div>

      {mode==='qr' ? (
        <QRScanner onDetected={(result)=>{ setStudentId(result); }} />
      ) : (
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Student ID" value={studentId} onChange={e=>setStudentId(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={selected?._id||''} onChange={e=>setSelected(foods.find(f=>f._id===e.target.value))}>
              <option value="">Select food</option>
              {foods.map(f=> <option key={f._id} value={f._id}>{f.name} — {f.price}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input type="number" min={1} className="form-control" value={qty} onChange={e=>setQty(Number(e.target.value))} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleAdd}>Add</button>
          </div>
        </div>
      )}
    </div>
  )
}
