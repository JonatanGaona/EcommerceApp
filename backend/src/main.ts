import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductService } from './product/product.service';
import { Product } from './product/product.entity';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir solicitudes desde diferentes orígenes.
  app.enableCors({
    origin: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Application is running on: http://0.0.0.0:${port}`);

  // Lógica del Seeder para Desarrollo:
  // Este bloque de código se encarga de poblar la base de datos con productos iniciales
  // si no existen productos previamente. Está diseñado para ejecutarse solo en entornos
  // de desarrollo para evitar la siembra de datos en producción.
 /*  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const productService = app.get(ProductService); // Obtiene una instancia de ProductService

    try {
      // Contar los productos existentes en la base de datos
      const products = await productService.findAll(); // <--- Usamos findAll() como lo tenías
      const productsCount = products.length; // <--- Y luego verificamos la longitud

      if (productsCount === 0) {
        console.log('No products found in DB. Seeding initial products...');

        // Define la lista de productos iniciales a ser sembrados.
        const initialProducts: Partial<Product>[] = [
          { id: 'prod_004', name: 'Gorra', description: 'Negra de algodón', price: 15.50, stock: 5 },
          { id: 'prod_005', name: 'Sudadera', description: 'Talla L, Gris', price: 45.00, stock: 7 },
          { id: 'prod_006', name: 'Camiseta', description: 'Talla M, Blanca', price: 30.99, stock: 15 },
          { id: uuidv4(), name: 'Pantalón', description: 'Jeans azul', price: 60.00, stock: 10 },
          { id: uuidv4(), name: 'Zapatos', description: 'Deportivos, negros', price: 85.00, stock: 3 },
        ];

        // Itera sobre los productos y los guarda en la base de datos.
        for (const productData of initialProducts) {
          await productService.create(productData);
        }
        console.log('Initial products seeded successfully.');
      } else {
        console.log(`Found ${productsCount} products in DB. Skipping seeding.`);
      }
    } catch (error) {
      console.error('Error during product seeding:', error);
    }
  } */
}

bootstrap();