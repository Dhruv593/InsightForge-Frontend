import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { PlanCatalog } from '../components/plans/PlanCatalog';
import { PlansComingSoon } from '../components/plans/PlansComingSoon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { loadRazorpayCheckout, paymentService } from '../services/paymentService';
import { siteContentService } from '../services/siteContentService';

export function PlansPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [purchasingPlan, setPurchasingPlan] = useState(null);

  useEffect(() => {
    let active = true;
    siteContentService.getPlans().then((response) => { if (active) setContent(response.content); }).catch(() => { if (active) setContent({ enabled: false }); });
    return () => { active = false; };
  }, []);

  async function purchase(planIndex) {
    setPurchasingPlan(planIndex);
    try {
      await loadRazorpayCheckout();
      const order = await paymentService.createOrder(planIndex);
      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Tatparya',
        description: `${order.plan_name} · ${order.credits} credits`,
        order_id: order.razorpay_order_id,
        prefill: { name: order.customer_name, email: order.customer_email },
        theme: { color: '#4338CA' },
        modal: { ondismiss: () => setPurchasingPlan(null) },
        handler: async (response) => {
          try {
            const result = await paymentService.verify(response);
            await refreshUser();
            toast.success(result.credits_added ? `${result.credits_added} credits added to your account.` : 'Payment already processed. Your balance is up to date.');
          } catch (failure) {
            toast.error(getApiError(failure, 'Payment was received but could not be confirmed yet.').message);
          } finally { setPurchasingPlan(null); }
        },
      });
      checkout.on('payment.failed', () => { setPurchasingPlan(null); toast.error('Payment was not completed, so no credits were added.'); });
      checkout.open();
    } catch (failure) {
      setPurchasingPlan(null);
      toast.error(getApiError(failure, failure?.message || 'Checkout could not be opened.').message);
    }
  }

  return <div className="min-h-screen bg-[#F5F5F7] pt-14">
    <AppHeader />
    <main className={`mx-auto flex min-h-[calc(100vh-3.5rem)] items-center px-4 py-12 sm:px-6 ${content?.enabled ? 'max-w-6xl' : 'max-w-3xl'}`}>
      {!content ? <div className="mx-auto h-72 w-full animate-pulse rounded-3xl bg-white" role="status"><span className="sr-only">Loading plans</span></div> : content.enabled ? <PlanCatalog content={content} currentCredits={user?.credits ?? 0} purchasingPlan={purchasingPlan} onPurchase={purchase} /> : <PlansComingSoon currentCredits={user?.credits ?? 0} onBack={() => navigate('/dashboard')} />}
    </main>
  </div>;
}
