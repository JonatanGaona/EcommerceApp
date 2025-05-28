import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ProductModule } from '../product/product.module'; 
import { ConfigModule } from '@nestjs/config'; 
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    ProductModule,
    ConfigModule,
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}