import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findOrCreateByEmail(email: string, details: Partial<Customer>): Promise<Customer> {
    let customer = await this.customerRepository.findOne({ where: { email } });
    if (!customer) {
      const customerId = details.id || uuidv4(); // Usa email como id o genera uno nuevo
      customer = this.customerRepository.create({ 
        ...details, 
        id: customerId, 
        email 
      });
      await this.customerRepository.save(customer);
    }
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }
}