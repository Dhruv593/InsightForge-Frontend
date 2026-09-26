import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const templateLabels = {
  email_verification: ['Email verification', 'Sent when a user registers or requests another verification email.'],
  password_reset: ['Password reset', 'Sent after a valid password-reset request.'],
  password_changed: ['Password changed', 'Sent after a password is changed or successfully reset.'],
  payment_confirmation: ['Credit purchase', 'Sent after Razorpay confirms payment and credits are added.'],
  credit_adjusted: ['Credit adjustment', 'Sent after an administrator manually changes a balance.'],
  account_deleted: ['Account deletion', 'Sent after the account and its stored application data are deleted.'],
  contact_reply: ['Contact reply', 'Sent when an administrator replies to a landing-page contact inquiry.'],
};

export function AdminEmailTemplatesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [variables, setVariables] = useState({});
  const [selected, setSelected] = useState('email_verification');
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    let active = true;
    siteContentService.getEmailTemplates()
      .then((response) => {
        if (!active) return;
        setContent(response.content);
        setVariables(response.variables ?? {});
        setMeta(response);
      })
      .catch((failure) => toast.error(getApiError(failure, 'Email templates could not be loaded.').message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast, user?.is_admin]);

  const current = content?.[selected];
  const variableList = useMemo(() => variables[selected] ?? [], [selected, variables]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  function update(field, value) {
    setContent((existing) => ({ ...existing, [selected]: { ...existing[selected], [field]: value } }));
  }

  function updateDetail(index, field, value) {
    const details = current.details.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
    update('details', details);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await siteContentService.updateEmailTemplates(content);
      setContent(response.content);
      setVariables(response.variables ?? variables);
      setMeta(response);
      toast.success('Email templates published.');
    } catch (failure) {
      toast.error(getApiError(failure, 'Email templates could not be published. Keep every required variable unchanged.').message);
    } finally { setSaving(false); }
  }

  return <AdminShell><div className="mx-auto grid max-w-6xl gap-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">Email templates</h2><p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[#6E6E73]">Edit transactional email copy. Variables inside double braces are protected and receive real values when an email is sent.</p></div><button className="min-h-10 rounded-lg bg-brand-600 px-5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" form="email-template-form" disabled={loading || saving || !content}>{saving ? 'Publishing…' : 'Publish changes'}</button></header>
    {meta?.updated_at && <p className="m-0 text-xs text-[#86868B]">Version {meta.version} · Last published {new Date(meta.updated_at).toLocaleString()}</p>}
    {loading || !current ? <div className="h-80 animate-pulse rounded-2xl bg-white" /> : <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit overflow-hidden rounded-2xl border border-[#E1E1E5] bg-white p-2 lg:sticky lg:top-20">{Object.entries(templateLabels).map(([key, [label, description]]) => <button className={`w-full rounded-xl border-0 px-3 py-3 text-left transition ${selected === key ? 'bg-brand-50 text-brand-800' : 'bg-transparent text-[#515154] hover:bg-[#F7F7F8]'}`} key={key} type="button" onClick={() => setSelected(key)}><span className="block text-xs font-semibold">{label}</span><span className="mt-1 block text-[10px] leading-4 text-[#86868B]">{description}</span></button>)}</aside>
      <form className="grid gap-5" id="email-template-form" onSubmit={save}>
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><h3 className="m-0 text-xs font-semibold text-blue-950">Protected variables</h3><p className="mb-3 mt-1 text-[11px] leading-5 text-blue-800">Keep these variables exactly as written. Publishing is blocked if one is removed, renamed, or an unsupported variable is added.</p><div className="flex flex-wrap gap-2">{variableList.map((variable) => <code className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[11px] text-blue-800" key={variable}>{variable}</code>)}</div></section>
        <section className="grid gap-4 rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6">
          <div><h3 className="m-0 text-base font-semibold">{templateLabels[selected][0]}</h3><p className="mb-0 mt-1 text-xs text-[#86868B]">{templateLabels[selected][1]}</p></div>
          <Field label="Subject" value={current.subject} onChange={(value) => update('subject', value)} />
          <Field label="Inbox preview text" value={current.preheader} onChange={(value) => update('preheader', value)} />
          <Field label="Email heading" value={current.title} onChange={(value) => update('title', value)} />
          <Field label="Message body" multiline value={current.body} onChange={(value) => update('body', value)} hint="Use a blank line to begin a new paragraph." />
          {current.action_label !== null && <Field label="Button label" value={current.action_label} onChange={(value) => update('action_label', value)} />}
          {current.notice !== null && <Field label="Security or support notice" multiline value={current.notice} onChange={(value) => update('notice', value)} />}
        </section>
        {current.details.length > 0 && <section className="grid gap-4 rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div><h3 className="m-0 text-sm font-semibold">Summary rows</h3><p className="mb-0 mt-1 text-xs text-[#86868B]">Labels can be edited. Variable values are locked so transaction data remains accurate.</p></div>{current.details.map((item, index) => <div className="grid gap-3 rounded-xl border border-[#ECECEF] bg-[#FAFAFB] p-4 sm:grid-cols-2" key={`${item.value}-${index}`}><Field label={`Row ${index + 1} label`} value={item.label} onChange={(value) => updateDetail(index, 'label', value)} /><Field label="Protected value" value={item.value} readOnly /></div>)}</section>}
      </form>
    </div>}
  </div></AdminShell>;
}

function Field({ label, value, onChange, multiline = false, readOnly = false, hint = '' }) {
  const className = `w-full rounded-xl border border-[#D2D2D7] px-3 py-2.5 text-sm leading-6 outline-none ${readOnly ? 'cursor-not-allowed bg-[#F5F5F7] font-mono text-xs text-[#6E6E73]' : 'bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-50'}`;
  return <label className="grid gap-1.5"><span className="text-xs font-medium text-[#3A3A3C]">{label}</span>{multiline ? <textarea className={`${className} min-h-32 resize-y`} value={value ?? ''} readOnly={readOnly} required={!readOnly} onChange={onChange ? (event) => onChange(event.target.value) : undefined} /> : <input className={className} value={value ?? ''} readOnly={readOnly} required={!readOnly} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />}{hint && <span className="text-[10px] text-[#86868B]">{hint}</span>}</label>;
}
