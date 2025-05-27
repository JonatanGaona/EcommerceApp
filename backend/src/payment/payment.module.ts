import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ProductModule } from '../product/product.module'; 
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ProductModule,
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}