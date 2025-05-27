import { Injectable } from '@nestjs/common';
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
}