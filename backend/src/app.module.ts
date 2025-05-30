// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { PaymentModule } from './payment/payment.module';
import { CustomerModule } from './customer/customer.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';

import { Product } from './product/product.entity';
import { Customer } from './customer/customer.entity';
import { Delivery } from './delivery/delivery.entity';
import { Order } from './order/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432', 10),
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Product, Customer, Delivery, Order], 
      synchronize: false,
      autoLoadEntities: true,
    }),
    ProductModule,
    PaymentModule,
    OrderModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}