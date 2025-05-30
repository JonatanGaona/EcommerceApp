
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'; 
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash } from 'crypto';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private productService: ProductService,
    private orderService: OrderService,
  ) {}

  async createWompiTransaction(productId: string, deliveryInfo: any): Promise<any> {

    const product = await this.productService.findOne(productId);
    if (!product) {
      this.logger.error(`Producto no encontrado con ID: ${productId}`);
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    // Calcular el monto en centavos.
    let amountInCents = Math.round(product.price * 100);
    const MIN_AMOUNT_WOMPI = 150000;

    // 1. GENERAR LA REFERENCIA ÚNICA PARA NUESTRA ORDEN LOCAL 
    const orderIdForReference = `ORDER-${Date.now()}-${productId}`;
    let finalAmountForOrderAndWompi = amountInCents;


    if (finalAmountForOrderAndWompi < MIN_AMOUNT_WOMPI) {
      this.logger.warn(`Monto total en centavos (${finalAmountForOrderAndWompi}) es menor al mínimo de Wompi (${MIN_AMOUNT_WOMPI}). Ajustando para la prueba...`);
      finalAmountForOrderAndWompi = MIN_AMOUNT_WOMPI;
    }


    // 2. CREAR LA ORDEN EN TU BASE DE DATOS CON ESTADO 'PENDING'
    let newLocalOrder;
    try {
      newLocalOrder = await this.orderService.createOrder({
        id: orderIdForReference,
        productId: product.id,
        amount: finalAmountForOrderAndWompi,
        status: 'PENDING',
        customerEmail: deliveryInfo.customerEmail || 'cliente@example.com',
        metadata: {
          deliveryName: deliveryInfo.name,
          deliveryAddress: deliveryInfo.address,
          deliveryCity: deliveryInfo.city,
          deliveryPhone: deliveryInfo.phone,
        },

      });
    } catch (dbError) {
      this.logger.error(`Error al crear la orden local en la BD: ${dbError.message}`, dbError.stack);
      throw new HttpException('Error al registrar la orden antes de contactar a Wompi.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // --- FIN DE CAMBIOS IMPORTANTES POR AHORA ---


    // Obtener las claves de API de Wompi desde las variables de entorno.
    const WOMPI_PRIVATE_KEY = this.configService.get<string>('WOMPI_PRIVATE_KEY');
    const WOMPI_PUBLIC_KEY = this.configService.get<string>('WOMPI_PUBLIC_KEY');
    const WOMPI_INTEGRITY_KEY = this.configService.get<string>('WOMPI_INTEGRITY_KEY');
    const WOMPI_API_BASE_URL = 'https://api-sandbox.co.uat.wompi.dev/v1';
    const FRONTEND_BASE_URL = this.configService.get<string>('FRONTEND_BASE_URL'); // Asegúrate que esta variable exista en tu .env

    if (!FRONTEND_BASE_URL) {
      this.logger.error('FRONTEND_BASE_URL no está configurada.');
      throw new Error('FRONTEND_BASE_URL no está configurada en las variables de entorno.');
    }
    if (!WOMPI_PRIVATE_KEY || !WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_KEY) {
      this.logger.error('Variables de Wompi no configuradas.');
      throw new Error('Variables de entorno de Wompi no configuradas correctamente.');
    }

    try {
      // 1. Obtener tokens de aceptación del comercio.
      const acceptanceTokenResponse = await axios.get(`${WOMPI_API_BASE_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
      const acceptanceToken = acceptanceTokenResponse.data.data.presigned_acceptance.acceptance_token;

      // 2. Tokenizar la tarjeta de prueba.
      const cardTokenResponse = await axios.post(`${WOMPI_API_BASE_URL}/tokens/cards`, {
        number: deliveryInfo.cardNumber || '4242424242424242', // Usa la tarjeta de deliveryInfo o la de prueba
        cvc: deliveryInfo.cvc || '123',
        exp_month: deliveryInfo.expMonth || '12',
        exp_year: deliveryInfo.expYear || '28',
        card_holder: deliveryInfo.name, // deliveryInfo.name debe ser el nombre del titular de la tarjeta
      }, {
        headers: { Authorization: `Bearer ${WOMPI_PUBLIC_KEY}` },
      });
      const cardToken = cardTokenResponse.data.data.id;

      // 3. Calcular la firma de integridad (hash SHA256).
      const currency = 'COP';
      const integrityString = `${orderIdForReference}${finalAmountForOrderAndWompi}${currency}${WOMPI_INTEGRITY_KEY}`;
      const integritySignature = createHash('sha256').update(integrityString).digest('hex');

      // 4. Construir y enviar los datos de la transacción a Wompi.
      const transactionData = {
        currency: currency,
        amount_in_cents: finalAmountForOrderAndWompi, 
        reference: orderIdForReference,
        customer_email: newLocalOrder.customerEmail,
        redirect_url: `${FRONTEND_BASE_URL}/payment-status`,
        metadata: {
          productId: product.id,
          productName: product.name,
          deliveryName: deliveryInfo.name,
          deliveryAddress: deliveryInfo.address,
          deliveryCity: deliveryInfo.city,
          deliveryPhone: deliveryInfo.phone,
        },
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: cardToken,
        },
        acceptance_token: acceptanceToken,
        signature: integritySignature,
      };

      const wompiResponse = await axios.post(
        `${WOMPI_API_BASE_URL}/transactions`,
        transactionData,
        { headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` } },
      );

      // Si Wompi devuelve un ID, actualiza la orden local con el wompiTransactionId
      if (wompiResponse.data?.data?.id) {
          await this.orderService.updateOrderStatus(newLocalOrder.id, wompiResponse.data.data.status, wompiResponse.data.data.id);         
      }


      return wompiResponse.data;

    } catch (error) {
      this.logger.error(`Error durante la interacción con Wompi para la orden ${newLocalOrder?.id || orderIdForReference}: ${error.message}`, error.stack);
      // Si newLocalOrder se creó, actualiza su estado a 'FAILED' o similar
      if (newLocalOrder && newLocalOrder.id) {
        try {
          await this.orderService.updateOrderStatus(newLocalOrder.id, 'ERROR_WOMPI_CALL');
        } catch (updateError) {
          this.logger.error(`Error al intentar actualizar la orden local ${newLocalOrder.id} a ERROR_WOMPI_CALL: ${updateError.message}`, updateError.stack);
        }
      }

      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      throw new HttpException(
        `Error al crear transacción con Wompi: ${errorMessage}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR, // Usa INTERNAL_SERVER_ERROR si no hay status de Wompi
      );
    }
  }
}