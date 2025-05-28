// src/order/order.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders') // El nombre de tu tabla en la DB
export class Order {
  @PrimaryColumn()
  id: string; // Usaremos el 'reference' de la app-api como ID de nuestra orden

  @Column()
  productId: string; // El ID del producto que se compró

  @Column()
  amount: number; // El monto de la transacción

  @Column({ default: 'PENDING' }) // Estado inicial
  status: string; // PENDING, APPROVED, DECLINED, etc.

  @Column({ nullable: true })
  wompiTransactionId: string; // El ID de la transacción de app-api

  @Column({ nullable: true })
  customerEmail: string; // Email del cliente

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}