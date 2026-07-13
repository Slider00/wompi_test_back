import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CartItemDto } from './dto/decrease-stock.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {
    // Si la base de datos ya tiene los productos pero con emojis viejos, limpiamos la colección para re-sembrar con URLs
    const firstProduct = await this.productModel.findOne().exec();
    if (firstProduct && !firstProduct.icon.startsWith('/')) {
      await this.productModel.deleteMany({});
    }

    const count = await this.productModel.countDocuments();
    if (count === 0) {
      await this.productModel.insertMany([
        {
          _id: 'prod-1',
          name: 'Auriculares Bluetooth Pro',
          description: 'Cancelación activa de ruido, batería de 30 horas y sonido premium.',
          price: 249900,
          icon: '/images/headphones.png',
          stock: 8,
        },
        {
          _id: 'prod-2',
          name: 'Reloj Inteligente Fit',
          description: 'Pantalla AMOLED, monitoreo de salud 24/7 y GPS integrado.',
          price: 379900,
          icon: '/images/smartwatch.png',
          stock: 5,
        },
        {
          _id: 'prod-3',
          name: 'Teclado Mecánico RGB',
          description: 'Switches mecánicos táctiles, retroiluminación RGB y conexión inalámbrica.',
          price: 189900,
          icon: '/images/keyboard.png',
          stock: 4,
        },
        {
          _id: 'prod-4',
          name: 'Cargador Inalámbrico Rápido',
          description: 'Carga magnética de 15W compatible con múltiples dispositivos.',
          price: 89900,
          icon: '/images/charger.png',
          stock: 12,
        },
      ]);
    }
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async decreaseStock(cart: CartItemDto[]): Promise<void> {
    // 1. Validar el stock disponible de todos los productos del carrito primero (all-or-nothing check)
    const productsToUpdate: { product: ProductDocument; newStock: number }[] = [];

    for (const item of cart) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
        );
      }

      productsToUpdate.push({
        product,
        newStock: product.stock - item.quantity,
      });
    }

    // 2. Realizar los descuentos de stock una vez que todos estén validados
    for (const update of productsToUpdate) {
      update.product.stock = update.newStock;
      await update.product.save();
    }
  }
}
