import { promises as fs } from 'fs'
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from '@/prisma/prisma.service';
import { join } from 'path';
import { PRODUCT_IMAGES } from './product-images';
import { Prisma } from '@/generated/prisma/client';
import { ProductsGateway } from './products.gateway';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class ProductsService {

  private readonly s3Client = new S3Client({
    region: 'us-east-1',
  })

  private readonly bucket = 'canoon-shoppy-products'

  constructor(private readonly prismaService: PrismaService, private readonly productsGateway: ProductsGateway) { }
  async createProduct(body: CreateProductRequest, userId: number) {
    const product = await this.prismaService.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        userId,
      }
    })

    this.productsGateway.handleProductUpdated()

    return product

  }

  async getProducts(status?: string) {
    const args: Prisma.ProductFindManyArgs = {}
    if (status === 'availible') {
      args.where = { sold: false }
    }

    const products = await this.prismaService.product.findMany(args);
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
     // await fs.access(imagePath, fs.constants.F_OK);
     const {Body} = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: `${productId}.png`,
      })
     )
      //console.log(`[Debug] Image found for productId: ${productId}`);
      return !!Body;
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
      throw new NotFoundException(`Product not found with id ${productId}`)
    }


  }

  async update(productId: number, data: Prisma.ProductUpdateInput) {
    const product = await this.prismaService.product.update({
      where: {
        id: productId,
      },
      data,
    })

    this.productsGateway.handleProductUpdated()
    return product
  }

  async uploadProductImage(productId: string, buffer: Buffer<ArrayBufferLike>) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${productId}.png`,
        Body: buffer,

      })
    )
  }


}