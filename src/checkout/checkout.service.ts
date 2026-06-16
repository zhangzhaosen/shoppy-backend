import { ProductsService } from '@/products/products.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {

  constructor(
    @Inject(Stripe) private readonly stripe: InstanceType<typeof Stripe>,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) { }
  async createSession(productId: number) {
    const product = await this.productsService.getProduct(productId)
    return this.stripe.checkout.sessions.create({
      metadata: {
        productId,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: product.price * 100,
            product_data: {
              name: product.name,
              description: product.description
            }
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
    })
  }

  async handleCheckoutWebhooks(event: any) {
    // console.log('checkout.service->handleCheckoutWebhooks, event', event)
    if (event.type !== 'checkout.session.completed') {
      return
    }

    const session = await this.stripe.checkout.sessions.retrieve(event.data.object.id)
    await this.productsService.update(Number(session.metadata?.productId), {
      sold: true,
    })

  }


}
