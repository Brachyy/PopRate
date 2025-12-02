import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ListProvider } from './context/ListContext'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ListProvider>
        <App />
      </ListProvider>
    </AuthProvider>
  </React.StrictMode>,
)
