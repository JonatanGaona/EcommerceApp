import { Controller, Get, Logger } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

@Controller('api/customers')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getAllCustomers(): Promise<Customer[]> {
    this.logger.log('Solicitud para obtener todos los clientes');
    return this.customerService.findAll();
  }
}