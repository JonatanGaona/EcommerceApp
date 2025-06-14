import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  providers: [DeliveryService],
  exports: [DeliveryService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}