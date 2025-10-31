import React from 'react'

export default function NavBar({ role, setRole }){
  return (
    <nav className="navbar navbar-expand bg-light mb-3 rounded p-2">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">UET Hostel</span>
        <div className="d-flex align-items-center ms-auto">
          <div className="me-3">
            <button className="btn btn-outline-secondary btn-sm">Notifications <span className="badge bg-danger">3</span></button>
          </div>
          <div>
            <div className="dropdown">
              <button className="btn btn-sm btn-primary dropdown-toggle" data-bs-toggle="dropdown">Profile</button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><a className="dropdown-item" href="#">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
