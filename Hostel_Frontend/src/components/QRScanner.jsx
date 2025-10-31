import React, { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onDetected, qrRegionId = 'qr-region' }){
  const ref = useRef(null)
  const scannerRef = useRef(null)

  useEffect(()=>{
    const regionId = qrRegionId
    scannerRef.current = new Html5Qrcode(regionId)
    const config = { fps: 10, qrbox: { width: 250, height: 250 } }
    scannerRef.current.start({ facingMode: 'environment' }, config, (decoded) => {
      if(onDetected) onDetected(decoded)
      // optionally stop after first detection
      // scannerRef.current.stop()
    }).catch(err => {
      // ignore init errors; show placeholder
      console.warn('QR init failed', err)
    })

    return ()=>{
      if(scannerRef.current){ scannerRef.current.stop().catch(()=>{}); scannerRef.current.clear(); }
    }
  },[onDetected, qrRegionId])

  return (
    <div>
      <div id={qrRegionId} ref={ref} style={{width: '100%'}} className="border rounded p-2">
        <p className="mb-0">Point camera at QR code to scan. If camera access is blocked, use manual mode.</p>
      </div>
    </div>
  )
}
