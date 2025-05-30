// src/order/order.service.ts
import { Injectable, NotFoundException, Logger  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ProductService } from '../product/product.service';
import { CustomerService } from '../customer/customer.service';
import { DeliveryService } from '../delivery/delivery.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductService, 
    private customerService: CustomerService,
    private deliveryService: DeliveryService,
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

    const previousStatus = order.status;
    order.status = status;
    if (wompiTransactionId) {
      order.wompiTransactionId = wompiTransactionId;
    }
    const updatedOrder = await this.orderRepository.save(order);

    // Solo procesar si el estado cambió a APPROVED
    if (previousStatus !== 'APPROVED' && status === 'APPROVED') {
      if (updatedOrder.productId) {
        try {
          await this.productService.decreaseStock(updatedOrder.productId, 1);
        } catch (error) {
          this.logger.error(`Error al reducir stock para producto ${updatedOrder.productId}: ${error.message}`, error.stack);
        }
      } else {
        this.logger.warn(`La orden aprobada ${id} no tiene un productId para reducir stock.`);
      }
      const customerDetails = {
        name: updatedOrder.metadata?.deliveryName || 'Cliente de Orden ' + updatedOrder.id, // Ejemplo de cómo podrías tener el nombre
        phone: updatedOrder.metadata?.deliveryPhone || null, // Ejemplo
      };
      const customer = await this.customerService.findOrCreateByEmail(updatedOrder.customerEmail, customerDetails);

      if (customer) {
        const deliveryData = {
          orderId: updatedOrder.id,
          customerId: customer.id,
          customerName: customer.name,
          address: updatedOrder.metadata?.deliveryAddress || 'Dirección no especificada',
          city: updatedOrder.metadata?.deliveryCity || 'Ciudad no especificada',
          phone: customer.phone,
        };
        await this.deliveryService.createDelivery(deliveryData);
      }

    }
    return updatedOrder;
  }

  async findByWompiId(wompiId: string): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { wompiTransactionId: wompiId } });
  }

}