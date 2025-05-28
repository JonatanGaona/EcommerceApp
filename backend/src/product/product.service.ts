import { Injectable, 
  NotFoundException,
  HttpStatus,
  HttpException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>
  ) {}

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async create(data: Partial<Product>): Promise<Product> {
    if (!data.id) {
      data.id = uuidv4();
    }
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async findOne(id: string): Promise<Product | null> { 
    return this.repo.findOne({ where: { id } });
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