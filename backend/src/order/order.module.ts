// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { CustomerModule } from '../customer/customer.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ProductModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService], 
})
export class OrderModule {}