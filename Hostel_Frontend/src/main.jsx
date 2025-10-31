import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import App from './App'
import ToastManager from './components/ToastManager'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastManager>
      <App />
    </ToastManager>
  </React.StrictMode>
)
