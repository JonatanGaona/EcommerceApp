import React, { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';
import PaymentModal from './components/PaymentModal'; 

/**
 * Componente principal de la aplicación.
 * Se encarga de mostrar la lista de productos y gestionar la apertura del modal de pago.
 */
function App() {
  // Estado para almacenar la lista de productos obtenidos del backend.
  const [products, setProducts] = useState([]);
  // Estado para controlar la visibilidad del modal de pago.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para almacenar el producto seleccionado antes de abrir el modal de pago.
  const [selectedProduct, setSelectedProduct] = useState(null); 

  /**
   * Hook useEffect para cargar los productos desde el backend cuando el componente se monta.
   */
  useEffect(() => {
    // Realiza una solicitud al backend para obtener la lista de productos.
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err)); // Mensaje de error más descriptivo
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente.

  /**
   * Maneja el evento de clic en el botón "Comprar" de una ProductCard.
   * Almacena el producto seleccionado y abre el modal de pago.
   * @param {object} product - El objeto del producto que se ha seleccionado.
   */
  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  /**
   * Maneja el evento de cierre del modal de pago.
   * Cierra el modal y restablece el producto seleccionado.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Productos Disponibles</h1> {/* Título más descriptivo */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}> {/* Añadido 'gap' para mejor espaciado */}
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onBuyClick={handleBuyClick}
          />
        ))}
      </div>

      {/* Modal de pago, solo se renderiza si isModalOpen es true */}
      <PaymentModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
}

export default App;