import { Controller, Get, Logger } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';

@Controller('api/deliveries')
export class DeliveryController {
  private readonly logger = new Logger(DeliveryController.name);
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async getAllDeliveries(): Promise<Delivery[]> {
    return this.deliveryService.findAll();
  }
}