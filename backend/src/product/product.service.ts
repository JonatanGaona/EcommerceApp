import { Injectable, InternalServerErrorException, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>, // Usando 'repo' como lo tenías
  ) {}

  async findAll(): Promise<Product[]> {
    this.logger.log('Servicio: Intentando obtener todos los productos...'); // Log de inicio
    try {
      const products = await this.repo.find();
      this.logger.log(`Servicio: Se encontraron ${products.length} productos.`); // Log de éxito
      return products;
    } catch (error) {
      this.logger.error('Servicio: ERROR al obtener productos:', error.stack); // Log del error COMPLETO (incluye el stack trace)
      // Lanza una excepción HTTP estándar de NestJS para que la respuesta sea manejada
      throw new InternalServerErrorException('Ocurrió un error en el servidor al intentar obtener los productos.');
    }
  }

  async create(data: Partial<Product>): Promise<Product> {
    this.logger.log(`Servicio: Intentando crear producto con datos: ${JSON.stringify(data)}`);
    if (!data.id) {
      data.id = uuidv4(); // Genera ID si no viene
      this.logger.log(`Servicio: ID generado para nuevo producto: ${data.id}`);
    }
    try {
      const product = this.repo.create(data);
      await this.repo.save(product);
      this.logger.log(`Servicio: Producto creado exitosamente: ${product.name} con id ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Servicio: ERROR al crear producto ${data.name || 'sin nombre asignado aún'}:`, error.stack);
      throw new InternalServerErrorException(`Error al crear el producto: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Product | null> {
    this.logger.log(`Servicio: Buscando producto con ID: ${id}`);
    try {
      const product = await this.repo.findOne({ where: { id } });
      if (!product) {
        this.logger.warn(`Servicio: Producto con ID "${id}" no encontrado.`);
        // No es necesario lanzar NotFoundException aquí si quieres que el servicio devuelva null
        // y que el controlador maneje el 404. Pero si quieres que el servicio sea estricto:
        // throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
      } else {
        this.logger.log(`Servicio: Producto encontrado con ID: ${id}`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Servicio: ERROR buscando producto con ID ${id}:`, error.stack);
      throw new InternalServerErrorException(`Error al buscar el producto con ID ${id}.`);
    }
  }

  async decreaseStock(productId: string, quantityToDecrease: number): Promise<Product> {
    // Puedes añadir un this.logger.log si has configurado un Logger para esta clase,
    // si no, un console.log también sirve para depurar inicialmente.
    console.log(`Intentando reducir stock para producto ${productId} en ${quantityToDecrease} unidades.`);

    const product = await this.findOne(productId); // Tu método findOne devuelve Product | null

    if (!product) {
      // Si findOne devuelve null, el producto no existe.
      console.error(`Producto con ID "${productId}" no encontrado para reducir stock.`);
      // Es buena práctica lanzar NotFoundException de @nestjs/common
      throw new NotFoundException(`Producto con ID "${productId}" no encontrado para reducir stock.`);
    }

    if (product.stock < quantityToDecrease) {
      console.error(`Stock insuficiente para producto ${productId}. Stock actual: ${product.stock}, Cantidad solicitada a reducir: ${quantityToDecrease}`);
      // HttpException de @nestjs/common
      throw new HttpException('Stock insuficiente para el producto solicitado.', HttpStatus.CONFLICT);
    }

    product.stock -= quantityToDecrease;
    console.log(`Stock para producto ${productId} reducido. Nuevo stock: ${product.stock}`);
    return this.repo.save(product); // Usas this.repo para acceder al repositorio
  }

}