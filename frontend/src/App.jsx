import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage'; // Crearemos esta página/componente
import PaymentStatusPage from './pages/PaymentStatusPage'; // Crearemos esta página/componente
// Asegúrate de que las importaciones de tus componentes de UI como PaymentModal estén donde se usan.

function App() {
  return (
    <Router>
      <div className="App" style={{ padding: '2rem' }}> {/* Puedes mantener un padding global aquí */}
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          {/* Podrías añadir más rutas aquí en el futuro si es necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;