import { useState } from 'react';
import { getApiError } from '../../services/api';
import { siteContentService } from '../../services/siteContentService';
import { landingHeading, paletteFor } from './landingStyles';

export function ContactSection({ content, order }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status.type === 'error') setStatus({ type: '', message: '' });
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await siteContentService.submitContact(form);
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
      setStatus({ type: 'success', message: response.message || content.success_message });
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Your message could not be sent. Please try again.').message });
    } finally {
      setSubmitting(false);
    }
  }

  const palette = paletteFor(content.theme);
  return <section id="contact" className={`scroll-mt-20 border-t ${palette.border} ${palette.section}`} style={{ order }}><div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-24">
    <div className="lg:col-span-5"><h2 className={`${landingHeading} ${palette.heading}`}>{content.title}<br /><span className={palette.accent}>{content.accent}</span></h2><p className={`mb-0 mt-5 max-w-lg text-base leading-7 ${palette.body}`}>{content.description}</p><dl className="mt-8 grid gap-3 text-sm"><ContactDetail label="Email" value={content.email} href={`mailto:${content.email}`} palette={palette} /><ContactDetail label="Phone" value={content.phone} palette={palette} /><ContactDetail label="Location" value={content.address} palette={palette} /></dl></div>
    <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)] sm:p-7 lg:col-span-7" onSubmit={submit}><div><h3 className="m-0 text-xl font-semibold tracking-[-0.025em] text-slate-950">{content.form_title}</h3><p className="mb-0 mt-1 text-xs leading-5 text-slate-500">We’ll reply to the email address you provide.</p></div><div className="grid gap-4 sm:grid-cols-2"><ContactField label="Name" name="name" value={form.name} onChange={update} autoComplete="name" /><ContactField label="Email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" /></div><ContactField label="Subject (optional)" name="subject" value={form.subject} onChange={update} required={false} /><label className="grid gap-2 text-sm font-medium text-slate-700">Message<textarea className="min-h-32 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none transition hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name="message" value={form.message} onChange={update} required minLength={10} maxLength={5000} /></label><label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">Website<input name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" /></label>{status.message && <p className={`m-0 rounded-xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>}<button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:justify-self-start" type="submit" disabled={submitting}>{submitting ? 'Sending…' : content.submit_label}</button></form>
  </div></section>;
}

function ContactDetail({ label, value, href, palette }) {
  const Value = href ? 'a' : 'span';
  return <div className={`grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b py-3 ${palette.border}`}><dt className={`text-xs font-semibold uppercase tracking-[0.08em] ${palette.muted}`}>{label}</dt><dd className={`m-0 min-w-0 break-words font-medium ${palette.body}`}><Value href={href} className={palette.heading}>{value}</Value></dd></div>;
}

function ContactField({ label, name, value, onChange, type = 'text', autoComplete, required = true }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700">{label}<input className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-normal outline-none transition hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name={name} type={type} value={value} onChange={onChange} autoComplete={autoComplete} required={required} maxLength={160} /></label>;
}
