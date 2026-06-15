import { Injectable } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductsService {

  constructor(private readonly prismaService: PrismaService){}
  createProduct(body: CreateProductRequest, userId: number) {
   return this.prismaService.product.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      userId,
    }
   })
  }
}
