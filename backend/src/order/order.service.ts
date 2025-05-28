// src/order/order.service.ts
import { Injectable, NotFoundException, Logger  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductService, 
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async findOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Orden con ID "${id}" no encontrada.`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: string, wompiTransactionId?: string): Promise<Order> {
    const order = await this.findOrderById(id); // Usa el método que ya maneja NotFoundException

    order.status = status;
    if (wompiTransactionId) {
      order.wompiTransactionId = wompiTransactionId;
    }
    const updatedOrder = await this.orderRepository.save(order);
    this.logger.log(`Orden ${id} actualizada en BD a estado: ${status}`);

    // --- LÓGICA DE REDUCCIÓN DE STOCK ---
    if (status === 'APPROVED') {
      if (updatedOrder.productId) {
        try {
          await this.productService.decreaseStock(updatedOrder.productId, 1); // Asumimos cantidad 1
          this.logger.log(`Stock reducido para el producto ${updatedOrder.productId} de la orden ${id}`);
        } catch (error) {
          this.logger.error(`Error al reducir stock para producto ${updatedOrder.productId}: ${error.message}`, error.stack);
          // Considera qué hacer aquí: ¿revertir el estado de la orden? ¿marcarla para revisión?
          // Por ahora, solo logueamos el error.
        }
      } else {
        this.logger.warn(`La orden aprobada ${id} no tiene un productId para reducir stock.`);
      }
    }
    return updatedOrder;
  }
}