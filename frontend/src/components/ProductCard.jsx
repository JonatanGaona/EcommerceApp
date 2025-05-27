import React from 'react';

/**
 * Componente ProductCard.
 * Muestra la información de un producto individual y un botón para iniciar el proceso de compra.
 *
 * @param {object} props - Propiedades del componente.
 * @param {object} props.product - Objeto que contiene los detalles del producto (id, name, description, price, stock).
 * @param {function} props.onBuyClick - Función de callback que se ejecuta al hacer clic en el botón "Comprar",
 * pasando el objeto del producto como argumento.
 */
const ProductCard = ({ product, onBuyClick }) => { 
  return (
    <div style={styles.card}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p><strong>Precio:</strong> ${product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      {/* Botón para iniciar la compra, que llama a la función onBuyClick con el producto actual. */}
      <button onClick={() => onBuyClick(product)}>Comprar</button> 
    </div>
  );
};

// Estilos en línea para el componente ProductCard.
const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem', // Usado para espaciado entre las tarjetas.
    width: '200px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex', // Añadido para mejor control del layout interno
    flexDirection: 'column', // Los elementos se apilan verticalmente
    justifyContent: 'space-between', // Distribuye el espacio entre los elementos
    alignItems: 'flex-start', // Alinea los elementos al inicio horizontalmente
  }
};

export default ProductCard;