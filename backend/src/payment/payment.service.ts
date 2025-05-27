import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash } from 'crypto';
import { ProductService } from '../product/product.service';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private productService: ProductService,
  ) {}

  /**
   * Procesa la creación de una transacción de pago con Wompi.
   * Realiza la obtención de tokens de aceptación, tokenización de tarjeta (para pruebas)
   * calcula la firma de integridad y envía la transacción a Wompi.
   *
   * @param productId El ID del producto a comprar.
   * @param deliveryInfo Los detalles de la información de entrega del cliente.
   * @returns La respuesta completa de Wompi de la transacción creada.
   * @throws HttpException si el producto no se encuentra o hay un error en la comunicación con Wompi.
   */
  async createWompiTransaction(productId: string, deliveryInfo: any): Promise<any> {
    // Buscar el producto en la base de datos
    const product = await this.productService.findOne(productId);
    if (!product) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    // Calcular el monto en centavos. Wompi requiere el monto en la unidad más pequeña de la moneda.
    let amountInCents = Math.round(product.price * 100);
    // Wompi tiene un monto mínimo para transacciones. Se ajusta para el entorno de pruebas.
    const MIN_AMOUNT_WOMPI = 150000; // Equivalente a 1,500 COP.

    if (amountInCents < MIN_AMOUNT_WOMPI) {
      console.warn(`Monto total en centavos (${amountInCents}) es menor al mínimo de Wompi (${MIN_AMOUNT_WOMPI}). Ajustando para la prueba...`);
      amountInCents = MIN_AMOUNT_WOMPI;
    }

    // Obtener las claves de API de Wompi desde las variables de entorno.
    const WOMPI_PRIVATE_KEY = this.configService.get<string>('WOMPI_PRIVATE_KEY');
    const WOMPI_PUBLIC_KEY = this.configService.get<string>('WOMPI_PUBLIC_KEY');
    const WOMPI_INTEGRITY_KEY = this.configService.get<string>('WOMPI_INTEGRITY_KEY');
    const WOMPI_API_BASE_URL = 'https://api-sandbox.co.uat.wompi.dev/v1'; // URL para el entorno UAT Sandbox de Wompi.
    const FRONTEND_BASE_URL = this.configService.get<string>('FRONTEND_BASE_URL');

    // Validar que todas las variables de entorno necesarias estén configuradas.
    if (!FRONTEND_BASE_URL) {
      throw new Error('FRONTEND_BASE_URL no está configurada en las variables de entorno.');
    }
    if (!WOMPI_PRIVATE_KEY || !WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_KEY) {
      throw new Error('Variables de entorno de Wompi no configuradas correctamente.');
    }

    try {
      // 1. Obtener tokens de aceptación del comercio.
      // Este token es necesario para crear transacciones.
      const acceptanceTokenResponse = await axios.get(`${WOMPI_API_BASE_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
      const acceptanceToken = acceptanceTokenResponse.data.data.presigned_acceptance.acceptance_token;
      const acceptPersonalAuth = acceptanceTokenResponse.data.data.presigned_acceptance.perm_url; // Posible URL de autenticación personal

      // 2. Tokenizar la tarjeta de prueba.
      // En un entorno de producción, la tokenización se realiza generalmente en el frontend
      // para evitar el manejo de datos sensibles de la tarjeta en el backend.
      const cardTokenResponse = await axios.post(`${WOMPI_API_BASE_URL}/tokens/cards`, {
        number: '4242424242424242', // Tarjeta de prueba Visa (Wompi Sandbox)
        cvc: '123',
        exp_month: '12',
        exp_year: '28',
        card_holder: deliveryInfo.name,
      }, {
        headers: {
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      });
      const cardToken = cardTokenResponse.data.data.id;

      // 3. Calcular la firma de integridad (hash SHA256).
      // Esta firma es una medida de seguridad que valida los datos de la transacción.
      // La cadena debe formarse en un orden específico según la documentación de Wompi.
      const reference = `ORDER-${Date.now()}-${productId}`; // Referencia única para la transacción
      const currency = 'COP';
      const integrityString = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`;
      const integritySignature = createHash('sha256').update(integrityString).digest('hex');

      // 4. Construir y enviar los datos de la transacción a Wompi.
      const transactionData = {
        currency: currency,
        amount_in_cents: amountInCents,
        reference: reference,
        customer_email: 'cliente@example.com',
        redirect_url: `${FRONTEND_BASE_URL}/payment-status`,
        metadata: {
          productId: product.id,
          productName: product.name,
          deliveryName: deliveryInfo.name,
          deliveryAddress: deliveryInfo.address,
          deliveryCity: deliveryInfo.city,
          deliveryPhone: deliveryInfo.phone,
          status: 'PENDING',
        },
        payment_method: {
          type: 'CARD',
          installments: 1, // Número de cuotas
          token: cardToken, // Token de la tarjeta obtenido previamente
        },
        acceptance_token: acceptanceToken, // Token de aceptación del comercio
        accept_personal_auth: acceptPersonalAuth, // Incluir si Wompi lo requiere para el flujo específico
        signature: integritySignature, // Firma de integridad calculada
      };

      // Enviar la solicitud de creación de transacción a Wompi.
      const wompiResponse = await axios.post(
        `${WOMPI_API_BASE_URL}/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`, // Autorización con la clave privada
          },
        },
      );
 // === TEMPORALMENTE REINTRODUCE ESTE LOG PARA DEPURAR ===
      console.log('--- Wompi Debug: Respuesta COMPLETA de Wompi API:', JSON.stringify(wompiResponse.data, null, 2));
      // =======================================================

      // La respuesta exitosa de Wompi contiene los detalles de la transacción creada.
      return wompiResponse.data;

    } catch (error) {
      // Manejo de errores de la API de Wompi o de red.
      // Se lanza una HttpException para que sea capturada por el controlador.
      throw new HttpException(
        `Error al crear transacción con Wompi: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
        error.response?.status || HttpStatus.BAD_REQUEST, // Usa el estado de error de Wompi o BAD_REQUEST por defecto
      );
    }
  }
}