import { api } from './api';

let checkoutPromise;

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutPromise) {
    checkoutPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-razorpay-checkout]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Razorpay checkout failed to load.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.razorpayCheckout = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Razorpay checkout failed to load.'));
      document.head.appendChild(script);
    }).catch((error) => { checkoutPromise = null; throw error; });
  }
  return checkoutPromise;
}

export const paymentService = {
  createOrder: (planIndex) => api.post('/payments/orders', { plan_index: planIndex }).then(({ data }) => data),
  verify: (payload) => api.post('/payments/verify', payload).then(({ data }) => data),
};
