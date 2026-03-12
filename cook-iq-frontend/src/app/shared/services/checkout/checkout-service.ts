import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private loading?: Promise<void>;

  private loadRazorpay(): Promise<void> {

    if ((window as any).Razorpay) return Promise.resolve();

    if (!this.loading) {
      this.loading = new Promise(resolve => {

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';

        script.onload = () => resolve();

        document.body.appendChild(script);
      });
    }

    return this.loading;
  }

  async openCheckout(options: {
    key: string
    subscriptionId: string
    name: string
    description: string
    color?: string
    handler?: (res: any) => Promise<void>
  }): Promise<void> {

    await this.loadRazorpay();

    return new Promise(resolve => {

      const rzp = new (window as any).Razorpay({
        key: options.key,
        subscription_id: options.subscriptionId,
        name: options.name,
        description: options.description,
        theme: { color: options.color || '#16a34a' },

        handler: async (response: any) => {
          await options.handler?.(response);
          resolve();
        },

        modal: {
          ondismiss: () => resolve()
        }
      });

      rzp.open();
    });
  }


}