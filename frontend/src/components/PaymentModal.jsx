import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect

// Constantes para tarifas fijas de la transacción.
const BASE_FEE = 2.50;
const DELIVERY_FEE = 5.00;

// Nombres de las claves para localStorage (para evitar errores de tipeo)
const LS_KEYS = {
  CARD_NUMBER: 'paymentForm_cardNumber',
  CARD_HOLDER: 'paymentForm_cardHolder',
  EXPIRY_DATE: 'paymentForm_expiryDate',
  CVV: 'paymentForm_cvv',
  DELIVERY_NAME: 'paymentForm_deliveryName',
  DELIVERY_ADDRESS: 'paymentForm_deliveryAddress',
  DELIVERY_CITY: 'paymentForm_deliveryCity',
  DELIVERY_PHONE: 'paymentForm_deliveryPhone',
};

const PaymentModal = ({ isOpen, onClose, product }) => {
  // Función para obtener valor inicial de localStorage o string vacío
  const getInitialState = (key) => localStorage.getItem(key) || '';

  // Estados para los campos, inicializados desde localStorage
  const [cardNumber, setCardNumber] = useState(() => getInitialState(LS_KEYS.CARD_NUMBER));
  const [cardHolder, setCardHolder] = useState(() => getInitialState(LS_KEYS.CARD_HOLDER));
  const [expiryDate, setExpiryDate] = useState(() => getInitialState(LS_KEYS.EXPIRY_DATE));
  const [cvv, setCvv] = useState(() => getInitialState(LS_KEYS.CVV));

  const [deliveryName, setDeliveryName] = useState(() => getInitialState(LS_KEYS.DELIVERY_NAME));
  const [deliveryAddress, setDeliveryAddress] = useState(() => getInitialState(LS_KEYS.DELIVERY_ADDRESS));
  const [deliveryCity, setDeliveryCity] = useState(() => getInitialState(LS_KEYS.DELIVERY_CITY));
  const [deliveryPhone, setDeliveryPhone] = useState(() => getInitialState(LS_KEYS.DELIVERY_PHONE));

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState('form');
  const [isLoading, setIsLoading] = useState(false);

  // Guardar en localStorage cada vez que un campo cambie
  useEffect(() => { localStorage.setItem(LS_KEYS.CARD_NUMBER, cardNumber); }, [cardNumber]);
  useEffect(() => { localStorage.setItem(LS_KEYS.CARD_HOLDER, cardHolder); }, [cardHolder]);
  useEffect(() => { localStorage.setItem(LS_KEYS.EXPIRY_DATE, expiryDate); }, [expiryDate]);
  useEffect(() => { localStorage.setItem(LS_KEYS.CVV, cvv); }, [cvv]);
  useEffect(() => { localStorage.setItem(LS_KEYS.DELIVERY_NAME, deliveryName); }, [deliveryName]);
  useEffect(() => { localStorage.setItem(LS_KEYS.DELIVERY_ADDRESS, deliveryAddress); }, [deliveryAddress]);
  useEffect(() => { localStorage.setItem(LS_KEYS.DELIVERY_CITY, deliveryCity); }, [deliveryCity]);
  useEffect(() => { localStorage.setItem(LS_KEYS.DELIVERY_PHONE, deliveryPhone); }, [deliveryPhone]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  const productPriceAsNumber = product && typeof product.price === 'string'
    ? parseFloat(product.price)
    : product?.price || 0;

  if (!isOpen) return null;

  const getCardType = (number) => { 
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'MasterCard';
    return '';
   };
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Validación de la tarjeta
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16 || !/^\d+$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'El número de tarjeta debe tener al menos 16 dígitos numéricos.';
      isValid = false;
    }
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'El nombre del titular es requerido.';
      isValid = false;
    }
    // ... (resto de tus validaciones para expiryDate, cvv) ...
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
        newErrors.expiryDate = 'Formato de fecha de vencimiento inválido (MM/AA).';
        isValid = false;
    } else {
        // ... tu lógica de validación de expiración de tarjeta ...
    }
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = 'CVV inválido (3 o 4 dígitos numéricos).';
        isValid = false;
    }

    // Validación de la información de entrega
    if (!deliveryName.trim()) {
      newErrors.deliveryName = 'El nombre completo de entrega es requerido.';
      isValid = false;
    }
    // ... (resto de tus validaciones para deliveryAddress, deliveryCity, deliveryPhone) ...
    if (!deliveryAddress.trim()) {
        newErrors.deliveryAddress = 'La dirección de entrega es requerida.';
        isValid = false;
    }
    if (!deliveryCity.trim()) {
        newErrors.deliveryCity = 'La ciudad de entrega es requerida.';
        isValid = false;
    }
    if (!deliveryPhone || !/^\d{7,}$/.test(deliveryPhone)) {
        newErrors.deliveryPhone = 'El número de teléfono es inválido (mínimo 7 dígitos).';
        isValid = false;
    }

    console.log('Dentro de validateForm - newErrors:', newErrors, 'isValid:', isValid);

    setErrors(newErrors);
    return isValid;
  };


  // Función para limpiar todos los campos del formulario y localStorage
  const clearFormAndStorage = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
    setDeliveryName('');
    setDeliveryAddress('');
    setDeliveryCity('');
    setDeliveryPhone('');
    setErrors({});
    setCurrentStep('form'); // Volver al primer paso del modal

    Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep('summary');
    } else {
      console.log('Formulario inválido. Por favor, corrige los errores antes de continuar.');
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleFinalPayment = async () => {
    setIsLoading(true);
    // Datos para enviar al backend (ajusta según lo que tu backend realmente necesita)
    const paymentPayload = {
        productId: product.id,
        deliveryInfo: { // Objeto que agrupa la información relevante
            name: deliveryName, // Nombre para la entrega Y para el titular de tarjeta (según tu backend actual)
            address: deliveryAddress,
            city: deliveryCity,
            phone: deliveryPhone,
            customerEmail: 'cliente_resiliente@example.com', // Deberías tener un input para esto
            // Datos de la tarjeta (tu backend actualmente usa una de prueba, pero es bueno pasarlos)
            cardNumber: cardNumber,
            cardExpMonth: expiryDate.split('/')[0],
            cardExpYear: expiryDate.split('/')[1], // Asegúrate de que sea 'YY'
            cardCvc: cvv,
            cardHolderName: cardHolder // Nombre del titular específico de la tarjeta
        }
    };


    try {
      // OJO: el `deliveryInfo` que pasas a `createWompiTransaction` en el backend
      // se usa para `card_holder: deliveryInfo.name` y para los datos de metadata.
      // Asegúrate de que la estructura de `paymentPayload.deliveryInfo` coincida con lo que espera el backend.
      const response = await  fetch(`${API_BASE_URL}/api/create-wompi-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload), // Envía el payload ajustado
      });

      if (!response.ok) { /* ... tu manejo de error ... */ }

      const data = await response.json();
      console.log('Respuesta del backend (inicio transacción):', data);

      if (data.redirect_url_base && data.wompi_transaction_id) {
        clearFormAndStorage(); // Limpiar el formulario y localStorage ANTES de redirigir
        const finalRedirectUrl = `${data.redirect_url_base}?id=${data.wompi_transaction_id}`;
        window.location.href = finalRedirectUrl;
      } else {
        alert('No se recibió la información completa para la redirección.');
      }
    } catch (error) { /* ... tu manejo de error ... */ }
    finally { setIsLoading(false); }
  };
  
  // Sobrescribir la función onClose para que también limpie el storage
  const handleModalClose = () => {
    clearFormAndStorage();
    onClose(); // Llama a la función onClose original pasada por props
  };

  const currentCardType = getCardType(cardNumber); 
  const totalAmount = productPriceAsNumber + BASE_FEE + DELIVERY_FEE;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={handleModalClose} 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer'
          }}
        >
          X
        </button>

        {currentStep === 'form' ? (
          <>
            <h2>Comprar {product.name}</h2>
            <p><strong>Precio:</strong> ${productPriceAsNumber.toFixed(2)}</p> 

            <form onSubmit={handleSubmit}>
              <h3>Información de la Tarjeta</h3>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="cardNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número de Tarjeta</label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))} 
                  maxLength="16"
                  placeholder="XXXX XXXX XXXX XXXX"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.cardNumber ? '1px solid red' : '1px solid #ccc' }}
                />
                {currentCardType && <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#007bff' }}>{currentCardType}</span>} 
                {errors.cardNumber && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.cardNumber}</p>}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="cardHolder" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Titular</label>
                <input
                  type="text"
                  id="cardHolder"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Nombre Apellido"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.cardHolder ? '1px solid red' : '1px solid #ccc' }}
                />
                {errors.cardHolder && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.cardHolder}</p>}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        setExpiryDate(value.substring(0, 5));
                    }}
                    maxLength="5" 
                    placeholder="MM/AA"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.expiryDate ? '1px solid red' : '1px solid #ccc' }}
                  />
                  {errors.expiryDate && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.expiryDate}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="cvv" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    maxLength="4" 
                    placeholder="123"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.cvv ? '1px solid red' : '1px solid #ccc' }}
                  />
                  {errors.cvv && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.cvv}</p>}
                </div>
              </div>

              <h3>Información de Entrega</h3>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="deliveryName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo</label>
                <input
                  type="text"
                  id="deliveryName"
                  value={deliveryName}
                  onChange={(e) => setDeliveryName(e.target.value)}
                  placeholder="Tu Nombre Completo"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.deliveryName ? '1px solid red' : '1px solid #ccc' }}
                />
                {errors.deliveryName && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.deliveryName}</p>}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="deliveryAddress" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección</label>
                <input
                  type="text"
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Calle 123 #4-56"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.deliveryAddress ? '1px solid red' : '1px solid #ccc' }}
                />
                {errors.deliveryAddress && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.deliveryAddress}</p>}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="deliveryCity" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ciudad</label>
                <input
                  type="text"
                  id="deliveryCity"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="Tu Ciudad"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.deliveryCity ? '1px solid red' : '1px solid #ccc' }}
                />
                {errors.deliveryCity && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.deliveryCity}</p>}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="deliveryPhone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono</label>
                <input
                  type="tel"
                  id="deliveryPhone"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="3XX XXX XXXX"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.deliveryPhone ? '1px solid red' : '1px solid #ccc' }}
                />
                {errors.deliveryPhone && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{errors.deliveryPhone}</p>}
              </div>
              
              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#007bff',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  fontSize: '1.1em', 
                  cursor: 'pointer',
                  marginTop: '20px',
                  transition: 'background-color 0.3s ease'
                }}
              >
                Continuar al Resumen de Pago
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: '20px' }}>
            <h2>Resumen de Pago</h2>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Producto:</strong> {product.name}</p>
              <p><strong>Cantidad:</strong> 1 (unidad)</p>
              <p><strong>Precio del Producto:</strong> ${productPriceAsNumber.toFixed(2)}</p>
              <p><strong>Tarifa Base:</strong> ${BASE_FEE.toFixed(2)}</p>
              <p><strong>Tarifa de Entrega:</strong> ${DELIVERY_FEE.toFixed(2)}</p>
            </div>
            <h3 style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Total a Pagar: ${totalAmount.toFixed(2)}
            </h3>

            <h4>Detalles de Entrega</h4>
            <p><strong>Nombre:</strong> {deliveryName}</p>
            <p><strong>Dirección:</strong> {deliveryAddress}</p>
            <p><strong>Ciudad:</strong> {deliveryCity}</p>
            <p><strong>Teléfono:</strong> {deliveryPhone}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button
                onClick={handleBackToForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  transition: 'background-color 0.3s ease'
                }}
              >
                Volver a la Información
              </button>
              <button
                onClick={handleFinalPayment}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isLoading ? '#cccccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease'
                }}
              >
                {isLoading ? 'Procesando Pago...' : `Pagar con Tarjeta ($${totalAmount.toFixed(2)})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;