// src/pages/PaymentStatusPage.jsx
import React, { useEffect, useState, useCallback } from 'react'; // Añade useCallback
import { useLocation, useNavigate } from 'react-router-dom';

const MAX_RETRIES = 3; // Intentar consultar el estado hasta 3 veces
const RETRY_DELAY_MS = 3000; // Esperar 3 segundos entre reintentos

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('Verificando...');
  const [message, setMessage] = useState('Estamos procesando el resultado de tu pago.');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Usamos useCallback para que la función no se recree innecesariamente
  const fetchOrderStatus = useCallback(async (wompiId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/by-wompi-id/${wompiId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error('Error fetching order status from backend:', err);
      throw err; // Propaga para que el .catch del useEffect lo maneje
    }
  }, []); // fetchOrderStatus no depende de nada que cambie

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const wompiTransactionId = queryParams.get('id');

    if (wompiTransactionId) {
      setIsLoading(true); // Asegurarse que isLoading está true al empezar/reintentar
      fetchOrderStatus(wompiTransactionId)
        .then(orderData => {
          setOrderStatus(orderData.status);
          if (orderData.status === 'PENDING' && retryCount < MAX_RETRIES) {
            setMessage('Tu pago aún está pendiente. Verificando de nuevo en unos segundos...');
            setTimeout(() => {
              setRetryCount(prevCount => prevCount + 1); // Esto disparará el useEffect de nuevo si retryCount es dependencia
            }, RETRY_DELAY_MS);
            // No ponemos setIsLoading(false) aquí para que siga mostrando "cargando" o un mensaje intermedio
            return; // Salimos para no procesar el switch de abajo todavía
          }

          // Procesamiento final del estado
          switch (orderData.status) {
            case 'APPROVED':
              setMessage('¡Tu pago ha sido procesado con éxito!');
              break;
            case 'DECLINED':
              setMessage('Lo sentimos, tu pago ha sido rechazado.');
              break;
            case 'PENDING': // Si se agotaron los reintentos y sigue PENDING
              setMessage('Tu pago sigue pendiente. Por favor, contacta a soporte o intenta refrescar.');
              break;
            default:
              setMessage(`Estado de pago: ${orderData.status}.`);
          }
          setIsLoading(false);
        })
        .catch(err => {
          setError(`Error al verificar el estado del pago: ${err.message}`);
          setOrderStatus('Error');
          setMessage('No pudimos verificar el estado de tu pago en nuestro sistema.');
          setIsLoading(false);
        });
    } else {
      setError('No se encontró un ID de transacción en la URL.');
      setOrderStatus('Error');
      setMessage('Información de transacción inválida.');
      setIsLoading(false);
    }
  // El useEffect se ejecutará cuando location.search cambie (primera carga)
  // o cuando retryCount cambie (para los reintentos)
  // y fetchOrderStatus está memoizada con useCallback
  }, [location.search, retryCount, fetchOrderStatus]);

  // ... (el resto de tu JSX y estilos igual que antes) ...
  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading && orderStatus === 'Verificando...') { // Mostrar solo el primer "Verificando"
    return <div style={styles.container}><p>Verificando estado del pago, por favor espera...</p></div>;
  }
  // Para los reintentos, podría mostrarse el mensaje de "Verificando de nuevo..."
  // mientras isLoading podría ser false momentáneamente o gestionarse diferente.
  // Por simplicidad, la UI principal se muestra después del primer ciclo de carga o reintentos.

  return (
    <div style={styles.container}>
      <h1 style={{ color: orderStatus === 'APPROVED' ? '#28a745' : (orderStatus === 'PENDING' ? '#ffc107' : '#dc3545') }}>
        {orderStatus === 'APPROVED' ? 'Pago Aprobado' : 
         orderStatus === 'DECLINED' ? 'Pago Rechazado' :
         orderStatus === 'PENDING' ? 'Pago Pendiente' :
         orderStatus === 'Error' ? 'Error en la Transacción' :
         `Estado: ${orderStatus}`}
      </h1>
      <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>{message}</p>
      {error && <p style={{color: 'red', fontStyle: 'italic'}}>{error}</p>}
      
      <button onClick={handleGoHome} style={styles.button}>
        Volver a la Tienda
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh', // Menos que 100vh para acomodar el padding de App.jsx
    padding: '20px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  button: {
    padding: '12px 25px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '30px',
    textDecoration: 'none'
  }
};

export default PaymentStatusPage;