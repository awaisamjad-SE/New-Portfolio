import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function useToasts(){ return useContext(ToastContext) }

export default function ToastManager({ children }){
  const [toasts, setToasts] = useState([])

  const push = (msg, type='info', timeout=4000) =>{
    const id = Date.now()+Math.random()
    setToasts(t=>[...t, { id, msg, type }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id!==id)), timeout)
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div style={{position:'fixed', right:16, bottom:16, zIndex:1050}}>
        {toasts.map(t=> (
          <div key={t.id} className={`toast align-items-center text-bg-${t.type} border-0 show mb-2`} role="alert">
            <div className="d-flex">
              <div className="toast-body">{t.msg}</div>
              <button onClick={()=>setToasts(s=>s.filter(x=>x.id!==t.id))} className="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
