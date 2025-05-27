import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data))
      .catch(err => console.error('Error cargando productos', err));
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {products.map(prod => (
          <li key={prod.id}>
            <strong>{prod.name}</strong> - ${prod.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;