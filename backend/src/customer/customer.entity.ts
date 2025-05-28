import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity'; 

@Entity('customers')
export class Customer {
  @PrimaryColumn() 
  id: string; // Podría ser el email o un uuidv4()

  @Column({ nullable: true })
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  // Si quieres enlazar las órdenes a un cliente
  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}