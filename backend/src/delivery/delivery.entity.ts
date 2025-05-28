import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Order } from '../order/order.entity'; 

export enum DeliveryStatus {
  PENDING_SHIPMENT = 'PENDING_SHIPMENT',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryColumn()
  id: string;

  @Column()
  orderId: string; 

  @OneToOne(() => Order) 
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  customerId: string; 

  @Column()
  customerName: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING_SHIPMENT,
  })
  status: DeliveryStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}