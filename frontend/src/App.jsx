import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container"> 
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;