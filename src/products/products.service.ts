import { promises as fs } from 'fs'
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from '@/prisma/prisma.service';
import { join } from 'path';
import { PRODUCT_IMAGES } from './product-images';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class ProductsService {


  constructor(private readonly prismaService: PrismaService) { }
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

  async getProducts() {
    const products = await this.prismaService.product.findMany();
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }
  private async imageExists(productId: number) {
    const imagePath = join(PRODUCT_IMAGES, `${productId}.png`);
    //console.log(`[Debug] Checking for image at: ${imagePath}`);

    try {
      await fs.access(imagePath, fs.constants.F_OK);
      //console.log(`[Debug] Image found for productId: ${productId}`);
      return true;
    } catch (err) {
      // console.error(`[Debug] Error accessing image for productId ${productId}:`, err);
      return false;
    }
  }

  async getProduct(productId: number) {

    try {

      const product = await this.prismaService.product.findUniqueOrThrow({
        where: {
          id: productId,
        }
      })

      const result = {
        ...product,
        imageExists: await this.imageExists(productId),
      }

      return result

    } catch (e) {
      throw new NotFoundException( `Product not found with id ${productId}`)
    }


  }

  async update(productId: number, data: Prisma.ProductUpdateInput) {
    return this.prismaService.product.update({
      where: {
        id: productId,
      },
      data,
    })
  }

}