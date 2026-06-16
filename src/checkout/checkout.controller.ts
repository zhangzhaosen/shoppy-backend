import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateSessionRequest } from './dto/create-session.request';

@Controller('checkout')
export class CheckoutController {

  constructor(private readonly checkoutService: CheckoutService){

  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() request: CreateSessionRequest){
    return this.checkoutService.createSession(request.productId);
  }

  @Post('webhook')
  async handleCheckoutWebhooks(@Body() event:any){
    return this.checkoutService.handleCheckoutWebhooks(event);
  }
}
