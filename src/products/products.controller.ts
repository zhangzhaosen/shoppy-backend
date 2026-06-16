import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';

import type { TokenPayload } from '@/auth/token-payload.interface';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PRODUCT_IMAGES } from './product-images';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.productsService.createProduct(body, user.userId);
  }

  @Post(':productId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: PRODUCT_IMAGES,
      filename(req, file, callback) {
        callback(null, `${req.params.productId}${extname(file.originalname)}`);
      },
    })
  }))
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize: 5000000}),
          new FileTypeValidator({
            fileType: 'image/*'
          }),

        ]
      })
    )
    _file: Express.Multer.File,
    @CurrentUser() user: TokenPayload,
  ) {
    //return this.productsService.uploadProductImage(body, user.userId);
  }



  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts() {
    return this.productsService.getProducts();
  }

    @Get(':productId')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Param('productId') productId: string) {
    return this.productsService.getProduct(+productId);
  }


}
