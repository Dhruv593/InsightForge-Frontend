export function PlanCatalog({ content, currentCredits, purchasingPlan, onPurchase }) {
  return <section className="w-full">
    <header className="mx-auto max-w-2xl text-center"><span className="inline-flex rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{currentCredits} credits available</span><h1 className="mb-0 mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#1D1D1F] sm:text-5xl">{content.title}</h1><p className="mx-auto mb-0 mt-4 max-w-xl text-sm leading-6 text-[#6E6E73] sm:text-base">{content.description}</p></header>
    <div className={`mx-auto mt-9 grid max-w-5xl gap-4 ${content.plans.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}>{content.plans.map((plan, index) => <PlanCard key={`${plan.name}-${index}`} plan={plan} busy={purchasingPlan === index} onPurchase={() => onPurchase(index)} />)}</div>
    <p className="mx-auto mb-0 mt-6 max-w-3xl text-center text-xs leading-5 text-[#86868B]">{content.note}</p>
  </section>;
}

function PlanCard({ plan, busy, onPurchase }) {
  const unavailable = !plan.amount_paise;
  const price = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format((plan.amount_paise || 0) / 100);
  const actionClass = `mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border-0 px-4 text-sm font-semibold transition ${plan.highlighted ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-[#D2D2D7] bg-white text-[#1D1D1F] hover:bg-[#F7F7F8]'} ${unavailable ? 'cursor-not-allowed opacity-55' : ''}`;
  return <article className={`relative flex min-w-0 flex-col rounded-3xl border bg-white p-6 sm:p-8 ${plan.highlighted ? 'border-brand-500 shadow-[0_18px_60px_rgba(67,56,202,0.13)]' : 'border-[#E1E1E5]'}`}>
    {plan.highlighted && <span className="absolute right-5 top-5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-700">Popular</span>}
    <h2 className="m-0 pr-20 text-xl font-semibold tracking-[-0.025em] text-[#1D1D1F]">{plan.name}</h2><p className="mb-0 mt-2 min-h-10 text-xs leading-5 text-[#6E6E73]">{plan.description}</p>
    <div className="mt-6"><span className="text-3xl font-semibold tracking-[-0.04em] text-[#1D1D1F]">{price}</span><span className="ml-2 text-xs text-[#86868B]">{plan.billing_label}</span></div>
    <p className="mb-0 mt-2 text-sm font-semibold text-brand-700">{plan.credits.toLocaleString()} question credits</p>
    <ul className="mb-0 mt-6 grid flex-1 gap-3 p-0">{plan.features.map((feature, index) => <li className="flex list-none items-start gap-2.5 text-xs leading-5 text-[#515154]" key={index}><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">✓</span>{feature}</li>)}</ul>
    <button className={actionClass} type="button" disabled={unavailable || busy} title={unavailable ? 'Configure the payment amount in the admin dashboard' : undefined} onClick={onPurchase}>{busy ? 'Opening checkout…' : plan.button_label}</button>
    {unavailable && <span className="mt-2 text-center text-[10px] text-[#86868B]">Payment amount is not configured</span>}
  </article>;
}
