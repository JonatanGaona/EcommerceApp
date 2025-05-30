import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './delivery.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  async createDelivery(deliveryData: {
    orderId: string;
    customerId: string;
    customerName: string;
    address: string;
    city: string;
    phone?: string;
  }): Promise<Delivery> {
    const delivery = this.deliveryRepository.create({
      ...deliveryData,
      id: uuidv4(),
      status: DeliveryStatus.PENDING_SHIPMENT,
    });
    await this.deliveryRepository.save(delivery);
    return delivery;
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.find({ relations: ['order'] }); // Opcional cargar la orden
  }
}