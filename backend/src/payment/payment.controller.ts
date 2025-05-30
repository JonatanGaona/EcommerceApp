// src/payment/payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/order.service';
import { createHash, createHmac } from 'crypto';

@Controller('api')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
  ) {}

  @Post('create-wompi-transaction')
  async createTransaction(@Body() body: { productId: string; deliveryInfo: any }) {
    const { productId, deliveryInfo } = body;
    try {
      const transactionResponseFromService = await this.paymentService.createWompiTransaction(productId, deliveryInfo);
      const wompiTransactionId = transactionResponseFromService.data?.id;
      const baseRedirectUrl = transactionResponseFromService.data?.redirect_url; 

      if (!baseRedirectUrl || !wompiTransactionId) {
          this.logger.error('No se encontró redirect_url en la respuesta de Wompi.', transactionResponseFromService);
          throw new HttpException('Error al procesar la respuesta de Wompi: redirect_url faltante.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        message: 'Transacción en estado PENDING creada con éxito.',
        redirect_url_base: baseRedirectUrl,
        wompi_transaction_id: wompiTransactionId,
      };
    } catch (error) {
      this.logger.error(`Error en createTransaction: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al procesar la transacción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wompi-webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    this.logger.debug(`Webhook Headers: ${JSON.stringify(req.headers, null, 2)}`);
    this.logger.debug(`Webhook Body: ${JSON.stringify(req.body)}`);

    const wompiEventsSecretKey = this.configService.get<string>('WOMPI_EVENTS_SECRET_KEY');
    const eventBody = req.body;
    const receivedSignatureFromHeader = req.headers['x-event-checksum'] as string; // Intentamos leer el nuevo header
    const receivedSignatureFromBody = eventBody.signature?.checksum as string; // Firma desde el cuerpo
    const eventTimestamp = eventBody.timestamp; // Timestamp del evento

    // Usaremos la firma del cuerpo, que parece más confiable y viene con sus propiedades.
    const receivedSignature = receivedSignatureFromBody;

    if (!wompiEventsSecretKey) {
        this.logger.error('WOMPI_EVENTS_SECRET_KEY no está configurada en el backend.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Configuración de servidor incompleta.');
    }

    if (!receivedSignature || !eventTimestamp || !eventBody.signature?.properties) {
      this.logger.warn('Webhook Error: Falta firma (signature.checksum), timestamp o signature.properties en el body.');
      return res.status(HttpStatus.BAD_REQUEST).send('Datos de firma o timestamp faltantes o incompletos.');
    }

    // --- Verificación de la firma ---
    try {
     /* const propertiesToSign: string[] = eventBody.signature.properties;
      let stringToSign = '';

      // Concatenar los valores de las propiedades de la transacción
      for (const prop of propertiesToSign) {
        // Las propiedades son como "transaction.id", "transaction.status"
        // Necesitamos acceder a eventBody.data.transaction[nombre_real_propiedad]
        const propPath = prop.split('.'); // ej: ["transaction", "id"]
        let valueToSign = eventBody.data;
        for (const pathPart of propPath) {
            if (valueToSign && typeof valueToSign === 'object' && pathPart in valueToSign) {
                valueToSign = valueToSign[pathPart];
            } else {
                this.logger.error(`Propiedad para firmar no encontrada en el body: ${prop}`);
                throw new Error(`Propiedad para firmar no encontrada: ${prop}`);
            }
        }
        stringToSign += String(valueToSign); // Asegurarnos que es string
      }

      // Añadir el timestamp y la clave de integridad
       stringToSign += String(eventTimestamp) + wompiEventsSecretKey;
      this.logger.debug(`String construido para firmar: "${stringToSign}"`);

      const calculatedSignature = createHmac('sha256', wompiEventsSecretKey)
                                    .update(stringToSign)
                                    .digest('hex');

      if (receivedSignature !== calculatedSignature) {
        this.logger.error(`Webhook Error: ¡Firma inválida! Recibida: ${receivedSignature}, Calculada: ${calculatedSignature}`);
        return res.status(HttpStatus.UNAUTHORIZED).send('Firma inválida.');
      }
    } catch (error) { */
     const tx = eventBody.data.transaction;     
     const stringToSign = `${tx.id}${tx.status}${String(tx.amount_in_cents)}${String(eventTimestamp)}${wompiEventsSecretKey}`;

     this.logger.debug(`String construido para firmar (explícito y VALOR REAL): "${stringToSign}"`);

      const hash = createHash('sha256'); // Usar createHash para SHA256 directo
      hash.update(stringToSign);
      const calculatedSignature = hash.digest('hex');

     if (receivedSignature !== calculatedSignature) {
      this.logger.error(`Webhook Error: ¡Firma inválida! Recibida: ${receivedSignature}, Calculada: ${calculatedSignature}`);
      return res.status(HttpStatus.UNAUTHORIZED).send('Firma inválida.');
     }
    }catch (error) {
      this.logger.error(`Webhook Error: Falló la verificación de la firma: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error en la verificación de la firma.');
    }

    // --- Procesamiento del evento (igual que antes) ---
    const eventType = eventBody.event;
    const transaction = eventBody.data.transaction;

    if (!transaction || !transaction.reference || !transaction.status || !transaction.id) {
      this.logger.error('Webhook Error: Datos de transacción inválidos en el cuerpo del webhook.');
      return res.status(HttpStatus.BAD_REQUEST).send('Datos de transacción inválidos.');
    }

    const orderId = transaction.reference;
    const wompiTransactionId = transaction.id;
    const transactionStatus = transaction.status;

    try {
      switch (eventType) {
        case 'transaction.updated':
          await this.orderService.updateOrderStatus(orderId, transactionStatus, wompiTransactionId);

          if (transactionStatus === 'APPROVED') {
            const order = await this.orderService.findOrderById(orderId);
            if (order && order.productId) {
              this.logger.log(`App`);
            }
          }
          break;
        default:
          this.logger.log(`Evento de webhook no manejado`);
      }
      return res.status(HttpStatus.OK).send('Webhook recibido y procesado.');
    } catch (error) {
      this.logger.error(`Error procesando webhook para orden ${orderId}: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error interno al procesar el webhook.');
    }
  }
}