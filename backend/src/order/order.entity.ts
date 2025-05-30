import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';

@Entity('orders') 
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  productId: string;

  @Column()
  amount: number;

  @Column({ default: 'PENDING' }) // Estado inicial
  status: string; // PENDING, APPROVED, DECLINED, etc.

  @Column({ nullable: true })
  wompiTransactionId: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, customer => customer.orders, { nullable: true, eager: false }) // eager: false para no cargar siempre
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}