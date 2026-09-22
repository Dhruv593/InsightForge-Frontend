import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const newPlan = () => ({ name: 'New plan', description: 'Describe who this credit package is for.', price_label: '₹499', amount_paise: 49900, billing_label: 'one-time', credits: 10, features: ['10 analysis questions'], button_label: 'Purchase plan', button_href: '#', highlighted: false });

export function AdminPlansPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [meta, setMeta] = useState({ version: 0, updated_at: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    let active = true;
    siteContentService.getAdminPlans().then((response) => { if (active) { setContent(response.content); setMeta(response); } }).catch((failure) => toast.error(getApiError(failure, 'Plan settings could not be loaded.').message)).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast, user?.is_admin]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  function update(path, value) {
    setContent((current) => {
      const next = JSON.parse(JSON.stringify(current));
      const keys = path.split('.');
      let target = next;
      keys.slice(0, -1).forEach((key) => { target = target[key]; });
      target[keys.at(-1)] = value;
      return next;
    });
  }

  function addPlan() { setContent((current) => ({ ...current, plans: [...current.plans, newPlan()] })); }
  function removePlan(index) { setContent((current) => ({ ...current, plans: current.plans.filter((_, itemIndex) => itemIndex !== index) })); }
  function addFeature(planIndex) { update(`plans.${planIndex}.features`, [...content.plans[planIndex].features, 'New plan benefit']); }
  function removeFeature(planIndex, featureIndex) { update(`plans.${planIndex}.features`, content.plans[planIndex].features.filter((_, index) => index !== featureIndex)); }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await siteContentService.updatePlans(content);
      setContent(response.content);
      setMeta(response);
      toast.success('Plan page settings published.');
    } catch (failure) {
      toast.error(getApiError(failure, 'Plan page settings could not be saved.').message);
    } finally { setSaving(false); }
  }

  return <AdminShell><div className="mx-auto grid max-w-5xl gap-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">Plans page</h2><p className="mb-0 mt-2 text-sm leading-6 text-[#6E6E73]">Control whether pricing is visible and manage each credit package.</p></div><div className="flex gap-2"><Link className="rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C]" to="/plans" target="_blank">View page ↗</Link><button className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50" type="submit" form="plans-form" disabled={loading || saving}>{saving ? 'Publishing…' : 'Publish changes'}</button></div></header>
    {!loading && <div className="flex flex-wrap gap-4 text-[11px] text-[#86868B]"><span>Version {meta.version || 'not published'}</span>{meta.updated_at && <span>Last published {new Date(meta.updated_at).toLocaleString()}</span>}</div>}
    {loading || !content ? <div className="h-72 animate-pulse rounded-2xl bg-white" /> : <form className="grid gap-5" id="plans-form" onSubmit={save}>
      <section className="flex items-center justify-between gap-5 rounded-2xl border border-[#E1E1E5] bg-white p-5"><div><h3 className="m-0 text-sm font-semibold">Show purchasable plans</h3><p className="mb-0 mt-1 text-xs text-[#6E6E73]">{content.enabled ? 'Plan cards are visible on the plans page.' : 'Visitors see the default coming-soon page.'}</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${content.enabled ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-checked={content.enabled} onClick={() => update('enabled', !content.enabled)}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${content.enabled ? 'left-6' : 'left-1'}`} /></button></section>
      <section className="grid gap-4 rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-2"><Field label="Page heading" value={content.title} onChange={(value) => update('title', value)} /><Field label="Supporting note" value={content.note} onChange={(value) => update('note', value)} /></div><Field multiline label="Page description" value={content.description} onChange={(value) => update('description', value)} /></section>
      <div className="grid gap-4">{content.plans.map((plan, planIndex) => <section className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6" key={planIndex}>
        <div className="mb-5 flex items-center justify-between border-b border-[#ECECEF] pb-4"><div><h3 className="m-0 text-base font-semibold">Plan {planIndex + 1}</h3><p className="mb-0 mt-1 text-xs text-[#86868B]">Configure its pricing, credits, benefits, and checkout destination.</p></div><button className="border-0 bg-transparent text-xs font-semibold text-red-600 disabled:opacity-40" type="button" disabled={content.plans.length <= 1} onClick={() => removePlan(planIndex)}>Remove</button></div>
        <div className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Plan name" value={plan.name} onChange={(value) => update(`plans.${planIndex}.name`, value)} /><Field label="Credit amount" type="number" min="1" value={plan.credits} onChange={(value) => update(`plans.${planIndex}.credits`, Number(value))} /><Field label="Payment amount (₹)" type="number" min="1" step="0.01" value={(plan.amount_paise || 0) / 100} onChange={(value) => update(`plans.${planIndex}.amount_paise`, Math.round(Number(value) * 100))} /><Field label="Billing label" value={plan.billing_label} onChange={(value) => update(`plans.${planIndex}.billing_label`, value)} /></div><Field multiline label="Description" value={plan.description} onChange={(value) => update(`plans.${planIndex}.description`, value)} />
          <label className="flex items-center gap-2 text-xs font-medium text-[#3A3A3C]"><input className="accent-[#4338CA]" type="checkbox" checked={plan.highlighted} onChange={(event) => update(`plans.${planIndex}.highlighted`, event.target.checked)} />Highlight this plan as popular</label>
          <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">Included features</legend><div className="grid gap-2">{plan.features.map((feature, featureIndex) => <div className="flex gap-2" key={featureIndex}><input className="min-h-10 min-w-0 flex-1 rounded-lg border border-[#D2D2D7] px-3 text-sm outline-none focus:border-brand-500" value={feature} onChange={(event) => update(`plans.${planIndex}.features.${featureIndex}`, event.target.value)} required /><button className="rounded-lg border border-red-100 px-3 text-xs font-medium text-red-600 disabled:opacity-40" type="button" disabled={plan.features.length <= 1} onClick={() => removeFeature(planIndex, featureIndex)}>Remove</button></div>)}</div><button className="mt-3 rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40" type="button" disabled={plan.features.length >= 12} onClick={() => addFeature(planIndex)}>+ Add feature</button></fieldset>
          <Field label="Purchase button label" value={plan.button_label} onChange={(value) => update(`plans.${planIndex}.button_label`, value)} />
        </div>
      </section>)}</div>
      <div className="flex items-center justify-between"><button className="rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold disabled:opacity-40" type="button" disabled={content.plans.length >= 6} onClick={addPlan}>+ Add plan</button><button className="rounded-lg bg-brand-600 px-5 py-3 text-xs font-semibold text-white disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
    </form>}
  </div></AdminShell>;
}

function Field({ label, value, onChange, multiline = false, type = 'text', min, step }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="grid gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className={`w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${multiline ? 'min-h-24 resize-y leading-6' : 'min-h-10'}`} type={type} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}
