import { Controller, Post, Body, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('api')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Maneja la creación de una transacción de Wompi.
   * Recibe los datos del producto y la información de entrega desde el frontend.
   *
   * @param body - Objeto que contiene el ID del producto y los detalles de entrega.
   * @returns Un objeto con un mensaje y la URL de redirección proporcionada por Wompi.
   * @throws HttpException en caso de error durante el procesamiento de la transacción.
   */
  @Post('create-wompi-transaction')
  async createTransaction(@Body() body: { productId: string, deliveryInfo: any }) {
    const { productId, deliveryInfo } = body;
    try {
      // Llama al servicio de pago para iniciar la transacción con Wompi.
      // El servicio manejará la obtención de tokens, tokenización de tarjeta y creación de la transacción.
      const transactionResponse = await this.paymentService.createWompiTransaction(productId, deliveryInfo);

      // Si la transacción fue exitosa, Wompi devuelve una URL de redirección.
      // Esta URL se envía al frontend para que el usuario complete el flujo de pago o vea el estado.
      return {
        message: 'Transacción en estado PENDING creada con éxito.',
        // La respuesta del servicio debería contener la redirect_url de Wompi
        redirect_url: transactionResponse.data.redirect_url,
      };
    } catch (error) {
      // Captura y relanza cualquier error que ocurra durante el procesamiento de la transacción.
      // Si el error es una HttpException lanzada desde el servicio, se propagará directamente.
      // Si es otro tipo de error, se puede envolver en una HttpException genérica si es necesario.
      throw new HttpException(
        error.response || 'Error al procesar la transacción',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para manejar las notificaciones (webhooks) enviadas por Wompi.
   * Wompi utiliza este endpoint para informar sobre cambios en el estado de las transacciones (aprobada, declinada, etc.).
   * La lógica para verificar la firma del webhook y actualizar el estado de la transacción
   * en la base de datos debe implementarse aquí.
   *
   * @param req - Objeto de solicitud de Express.
   * @param res - Objeto de respuesta de Express.
   */
  @Post('wompi-webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    // Implementación futura:
    // 1. Verificar la firma del webhook para asegurar su autenticidad (usando la clave de integridad).
    // 2. Procesar el cuerpo del webhook para obtener el estado de la transacción.
    // 3. Actualizar el estado de la transacción correspondiente en la base de datos local.
    // 4. Enviar una respuesta HTTP 200 OK a Wompi para confirmar la recepción.

    console.log('Webhook POST /api/wompi-webhook recibido.');
    console.log('Webhook Body:', JSON.stringify(req.body, null, 2));

    // Lógica de procesamiento del webhook pendiente de implementación
    res.status(HttpStatus.OK).send('Webhook recibido');
  }
}