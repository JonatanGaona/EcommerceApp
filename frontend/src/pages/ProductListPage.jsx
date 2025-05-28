// src/pages/ProductListPage.jsx (NUEVO ARCHIVO)
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard'; // Ajusta la ruta si es necesario
import PaymentModal from '../components/PaymentModal'; // Ajusta la ruta si es necesario
// Importa tu servicio para obtener productos, por ejemplo:
// import { getProducts } from '../services/productService';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const fetchProducts = () => { // Función para poder llamarla de nuevo
    fetch(`${API_BASE_URL}/api/products`) // O usa tu servicio: getProducts()
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  /* const refreshProducts = () => {
    fetchProducts();
  }; */

  return (
    <>
      <h1>Productos Disponibles</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onBuyClick={handleBuyClick}
          />
        ))}
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
}

export default ProductListPage;