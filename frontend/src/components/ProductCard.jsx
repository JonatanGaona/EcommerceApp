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
      <h3 style={styles.productName}>{product.name}</h3>
      <p style={styles.description}>{product.description}</p>
      
      <div style={styles.details}>
        <p style={styles.price}>
          <strong>Precio:</strong> ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
        </p>
        <p style={styles.stock}>
          <strong>Stock:</strong> {product.stock}
        </p>
      </div>
      
      <button 
        onClick={() => onBuyClick(product)} 
        style={styles.buyButton} 
        className="button-primary" 
      >
        Comprar
      </button>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',         
    padding: '20px',              
    width: '250px',                 
    minWidth: '200px',
    margin: '10px',                
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',        
    backgroundColor: 'white',
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    minHeight: '280px',
    justifyContent: 'space-between', 
  },
  productName: {
    fontSize: '1.25em',
    fontWeight: '600',
    color: '#343a40',         
    margin: '0 0 10px 0',        
    lineHeight: '1.3',             
  },
  description: {
    fontSize: '0.9em',
    color: '#6c757d',           
    lineHeight: '1.5',
    marginBottom: '15px',
    flexGrow: 1, 
  },
  details: {
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    color: '#28a745',            
    margin: '0 0 5px 0',
  },
  stock: {
    fontSize: '0.9em',
    color: '#555',
    margin: 0,
  },
  buyButton: { 
    width: '100%',                 
  }
};

export default ProductCard;