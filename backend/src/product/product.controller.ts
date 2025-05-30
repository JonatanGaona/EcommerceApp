import { Controller, Get, Logger, InternalServerErrorException, HttpException  } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

   @Get()
  async findAll(): Promise<Product[]> {
    this.logger.log('Controlador: Petición GET a /products recibida.'); // Log de inicio}
    this.logger.warn('--- DEBUG: PRODUCT CONTROLLER - FINDALL INVOCADO ---');
    try {
      const products = await this.productService.findAll();
      this.logger.log(`Controlador: Devolviendo ${products.length} productos.`); // Log de éxito
      return products;
    } catch (error) {
      this.logger.error('Controlador: ERROR al procesar petición GET /products:', error.stack); // Log del error COMPLETO
      
      // Si el servicio ya lanzó una HttpException (como InternalServerErrorException),
      // simplemente relánzala para que NestJS la maneje.
      if (error instanceof HttpException) { // HttpException es la clase base para NotFoundException, etc.
        throw error;
      }
      // Si el error no es una HttpException (raro si el servicio está bien hecho),
      // entonces envuélvelo en una.
      throw new InternalServerErrorException('Ocurrió un error inesperado en el controlador al obtener los productos.');
    }
  }
}
