import React, { useState } from 'react';

// Constantes para tarifas fijas de la transacción.
const BASE_FEE = 2.50;
const DELIVERY_FEE = 5.00;

/**
 * Componente Modal de Pago.
 * Muestra un formulario para la información de tarjeta y entrega,
 * un resumen de pago y gestiona la interacción con el backend para iniciar la transacción Wompi.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.product - Objeto del producto seleccionado para la compra.
 */
const PaymentModal = ({ isOpen, onClose, product }) => {
  // Estados para los campos de información de la tarjeta.
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados para los campos de información de entrega.
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  // Estado para almacenar errores de validación del formulario.
  const [errors, setErrors] = useState({});
  // Estado para controlar los pasos del modal (formulario o resumen).
  const [currentStep, setCurrentStep] = useState('form'); 
  // Estado para indicar si una operación de pago está en curso (ej. envío al backend).
  const [isLoading, setIsLoading] = useState(false);

  // Convierte el precio del producto a número si es un string y maneja valores nulos.
  const productPriceAsNumber = product && typeof product.price === 'string' 
                               ? parseFloat(product.price) 
                               : product?.price || 0;

  // Si el modal no está abierto, no renderiza nada.
  if (!isOpen) return null;

  /**
   * Determina el tipo de tarjeta basado en el primer dígito del número de tarjeta.
   * @param {string} number - El número de tarjeta.
   * @returns {string} El tipo de tarjeta (Visa, MasterCard) o cadena vacía si no se reconoce.
   */
  const getCardType = (number) => {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'MasterCard';
    return '';
  };

  /**
   * Valida todos los campos del formulario antes de pasar al resumen o procesar el pago.
   * @returns {boolean} True si el formulario es válido, false en caso contrario.
   */
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
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
      newErrors.expiryDate = 'Formato de fecha de vencimiento inválido (MM/AA).';
      isValid = false;
    } else {
        const [month, year] = expiryDate.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            newErrors.expiryDate = 'La tarjeta ha expirado.';
            isValid = false;
        }
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

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Maneja el envío del formulario inicial.
   * Valida los campos y, si son válidos, avanza al paso de resumen.
   * @param {object} e - Objeto del evento de envío.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setCurrentStep('summary'); 
    } else {
      console.log('Formulario inválido. Por favor, corrige los errores antes de continuar.');
    }
  };

  /**
   * Regresa del paso de resumen al formulario de entrada de datos.
   */
  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  /**
   * Inicia el proceso de pago final enviando la información al backend.
   * Después de recibir una respuesta exitosa, redirige al usuario a la URL de Wompi.
   */
  const handleFinalPayment = async () => {
    setIsLoading(true); // Activar estado de carga

    const deliveryInfo = {
        name: deliveryName,
        address: deliveryAddress,
        city: deliveryCity,
        phone: deliveryPhone,
    };

    try {
        const response = await fetch('http://localhost:4000/api/create-wompi-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: product.id,
                deliveryInfo: deliveryInfo,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear transacción con Wompi');
        }

        const data = await response.json();
        console.log('Respuesta del backend (transacción Wompi):', data);

        // Si el backend proporciona una URL de redirección, navega al usuario a ella.
        if (data.redirect_url) {
            window.location.href = data.redirect_url; // Redirección completa a la pasarela de Wompi.
        } else {
            alert('No se recibió URL de redirección de Wompi. La transacción pudo haber sido creada.');
            // Considerar redirigir a una página de estado por defecto o mostrar un mensaje específico.
        }

    } catch (error) {
        console.error('Error durante el proceso de pago:', error);
        alert(`Error al procesar el pago: ${error.message || 'Ha ocurrido un error inesperado'}. Por favor, intenta de nuevo.`);
    } finally {
        setIsLoading(false); // Desactivar estado de carga.
        // No cerrar el modal aquí, ya que el usuario será redirigido o se mostrará un mensaje de error.
    }
  };

  // Calcula el tipo de tarjeta actual para mostrarlo al usuario.
  const currentCardType = getCardType(cardNumber);
  // Calcula el monto total a pagar incluyendo el precio del producto y las tarifas.
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
          onClick={onClose} 
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