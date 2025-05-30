import { Controller, Get, Param, NotFoundException, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Controller('api/orders') // Ruta base para este controlador
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  // Endpoint para que el frontend consulte por wompi_transaction_id
  @Get('by-wompi-id/:wompiId')
  async getOrderByWompiId(@Param('wompiId') wompiId: string): Promise<Order> {
    const order = await this.orderService.findByWompiId(wompiId);
    if (!order) {
      this.logger.warn(`Orden con wompiId ${wompiId} no encontrada.`);
      throw new NotFoundException(`Orden con wompi_id ${wompiId} no encontrada.`);
    }
    return order; // Devuelve la orden completa (incluyendo el estado)
  }
}