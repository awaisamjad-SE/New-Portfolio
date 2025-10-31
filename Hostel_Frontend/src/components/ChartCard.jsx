import React from 'react'

export default function ChartCard({ title, children }){
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <div style={{minHeight:180}}>{children}</div>
      </div>
    </div>
  )
}
