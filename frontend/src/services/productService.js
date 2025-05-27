// src/services/productService.js (U o bien, api.js si prefieres ese nombre)

// URL base de tu API de backend.
// Asegúrate de que este puerto coincida con el puerto en el que se ejecuta tu backend (ej. en main.ts).
const API_BASE_URL = 'http://localhost:4000'; 

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

    // Verifica si la respuesta de la red fue exitosa (código de estado 2xx).
    if (!response.ok) {
      // Si la respuesta no es OK, lanza un error con un mensaje descriptivo
      // que incluya el estado HTTP para facilitar la depuración.
      throw new Error(`Error al obtener los productos: ${response.status} ${response.statusText}`);
    }
    
    // Parsea la respuesta como JSON y la retorna.
    return response.json();
  } catch (error) {
    // Captura cualquier error de red o de la API y lo propaga.
    console.error('Fallo en la llamada a la API de productos:', error);
    throw error; // Re-lanza el error para que el componente lo maneje
  }
};