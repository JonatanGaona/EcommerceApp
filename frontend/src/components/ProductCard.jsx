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
        style={styles.buyButton} // Mantenemos estilos específicos si es necesario
        className="button-primary" // Usamos la clase global para el estilo base del botón
      >
        Comprar
      </button>
    </div>
  );
};

// Definición del objeto de estilos para ProductCard
const styles = {
  card: {
    border: '1px solid #e0e0e0',    // Borde más suave
    borderRadius: '10px',           // Bordes más redondeados
    padding: '20px',                // Buen padding interno
    width: '250px',                 // Ancho base de la tarjeta
    minWidth: '200px',
    margin: '10px',                 // Si no usas 'gap' en el contenedor padre flex
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Sombra sutil para dar profundidad
    display: 'flex',
    flexDirection: 'column',        // Organiza el contenido en columna
    backgroundColor: 'white',
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    // El siguiente estilo es para dar una altura mínima y ayudar con el botón al final
    // si las descripciones son de diferentes longitudes.
    minHeight: '280px', // Ajusta esta altura según tu contenido para que las tarjetas se vean uniformes
    justifyContent: 'space-between', // Empuja el contenido y el botón
  },
  // Omitimos styles.image por ahora
  productName: {
    fontSize: '1.25em',
    fontWeight: '600',
    color: '#343a40',              // Color oscuro para el nombre
    margin: '0 0 10px 0',           // Margen inferior
    lineHeight: '1.3',              // Altura de línea para el nombre
    // Para controlar el número de líneas visualmente (opcional, requiere más CSS si es estricto)
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    // display: '-webkit-box',
    // WebkitLineClamp: 2, // Muestra máximo 2 líneas
    // WebkitBoxOrient: 'vertical',
  },
  description: {
    fontSize: '0.9em',
    color: '#6c757d',              // Gris para la descripción
    lineHeight: '1.5',
    marginBottom: '15px',
    flexGrow: 1, // Permite que la descripción ocupe espacio si otras son más largas
                 // y ayuda a alinear los botones si las alturas de texto varían.
    // Para controlar el número de líneas visualmente (opcional)
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    // display: '-webkit-box',
    // WebkitLineClamp: 3, // Muestra máximo 3 líneas
    // WebkitBoxOrient: 'vertical',
  },
  details: {
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    color: '#28a745',              // Verde para el precio
    margin: '0 0 5px 0',
  },
  stock: {
    fontSize: '0.9em',
    color: '#555',
    margin: 0,
  },
  buyButton: { // Estilos específicos si la clase global no es suficiente o para anchos
    width: '100%',                  // El botón ocupa todo el ancho
    // marginTop: 'auto', // No es necesario si la card usa space-between
  }
};

export default ProductCard;