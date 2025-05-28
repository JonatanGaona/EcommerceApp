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
          if (orderData.status === 'PENDING' && retryCount < MAX_RETRIES) {
            setOrderStatus(orderData.status); // Actualiza a PENDING visualmente
            setMessage('Tu pago aún está pendiente. Verificando de nuevo en unos segundos...');
            // No se pone setIsLoading(false) aquí, para que siga "cargando"
            setTimeout(() => {
              setRetryCount(prevCount => prevCount + 1);
            }, RETRY_DELAY_MS);
          } else {
            // Estado final (APPROVED, DECLINED, o PENDING después de agotar reintentos)
            setOrderStatus(orderData.status);
            switch (orderData.status) {
              case 'APPROVED':
                setMessage('¡Tu pago ha sido procesado con éxito!');
                break;
              case 'DECLINED':
                setMessage('Lo sentimos, tu pago ha sido rechazado.');
                break;
              case 'PENDING':
                setMessage('Tu pago sigue pendiente después de varias verificaciones. Por favor, contacta a soporte.');
                break;
              default:
                setMessage(`Estado de pago: ${orderData.status}.`);
            }
            setIsLoading(false); // Termina la carga solo cuando hay un estado final o se agotan reintentos
          }
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
  }, [location.search, retryCount, fetchOrderStatus]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div style={styles.container}><p>{message || 'Verificando estado del pago, por favor espera...'}</p></div>;
  }

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