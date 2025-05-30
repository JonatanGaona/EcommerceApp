import { API_BASE_URL } from '../config/apiConfig';

/**
 * Realiza una solicitud HTTP para obtener la lista de productos desde el backend.
 * Este servicio centraliza las llamadas a la API relacionadas con productos.
 *
 * @returns {Promise<Array>} Una promesa que resuelve con un array de objetos de producto.
 * @throws {Error} Si la respuesta de la red no es exitosa o hay un problema con la API.
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`Error al obtener los productos: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fallo en la llamada a la API de productos:', error);
  }
};