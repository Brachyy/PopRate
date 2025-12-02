import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { ListProvider } from './context/ListContext';
import { SocialProvider } from './context/SocialContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocialProvider>
        <ListProvider>
          <App />
        </ListProvider>
      </SocialProvider>
    </AuthProvider>
  </React.StrictMode>,
);
