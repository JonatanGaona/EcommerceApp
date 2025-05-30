import { Controller, Get, Logger, InternalServerErrorException, HttpException  } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

   @Get()
  async findAll(): Promise<Product[]> {
    this.logger.warn('--- DEBUG: PRODUCT CONTROLLER - FINDALL INVOCADO ---');
    try {
      const products = await this.productService.findAll();
      return products;
    } catch (error) {
      this.logger.error('Controlador: ERROR al procesar petición GET /products:', error.stack); 
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocurrió un error inesperado en el controlador al obtener los productos.');
    }
  }
}
