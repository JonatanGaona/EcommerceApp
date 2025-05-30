import { Controller, Get, Logger, InternalServerErrorException  } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    this.logger.log('Received request to fetch all products.');
    try {
      return await this.productService.findAll();
    } catch (error) {
      this.logger.error('Error in controller while fetching products:', error.message);
      if (!(error instanceof InternalServerErrorException)) {
          throw new InternalServerErrorException('An unexpected error occurred in the product controller.');
      }
      throw error;
    }
  }
}
