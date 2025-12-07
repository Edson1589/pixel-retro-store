import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomerAuthProvider>
      <App />
    </CustomerAuthProvider>
  </React.StrictMode>,
);

