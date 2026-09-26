import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const filters = [['', 'All'], ['new', 'New'], ['read', 'Read'], ['replied', 'Replied'], ['closed', 'Closed']];

export function AdminContactsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0, counts: {} });
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    let active = true;
    setLoading(true);
    siteContentService.listContactInquiries(filter)
      .then((response) => {
        if (!active) return;
        setData(response);
        setSelectedId((current) => response.items.some((item) => item.id === current) ? current : response.items[0]?.id ?? null);
      })
      .catch((failure) => toast.error(getApiError(failure, 'Contact inquiries could not be loaded.').message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, toast, user?.is_admin]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
  const selected = data.items.find((item) => item.id === selectedId) ?? null;

  function applyItem(updated) {
    setData((current) => {
      const previous = current.items.find((item) => item.id === updated.id);
      const counts = { ...current.counts };
      if (previous && previous.status !== updated.status) {
        counts[previous.status] = Math.max(0, (counts[previous.status] ?? 1) - 1);
        counts[updated.status] = (counts[updated.status] ?? 0) + 1;
      }
      const items = filter && filter !== updated.status
        ? current.items.filter((item) => item.id !== updated.id)
        : current.items.map((item) => item.id === updated.id ? updated : item);
      return { ...current, counts, items };
    });
    if (filter && filter !== updated.status) setSelectedId(null);
  }

  async function selectInquiry(inquiry) {
    setSelectedId(inquiry.id);
    setReply('');
    if (inquiry.status !== 'new') return;
    try {
      applyItem(await siteContentService.updateContactInquiry(inquiry.id, 'read'));
    } catch { /* Reading a message remains available if the status update fails. */ }
  }

  async function updateStatus(status) {
    if (!selected) return;
    try {
      const updated = await siteContentService.updateContactInquiry(selected.id, status);
      applyItem(updated);
      toast.success(status === 'closed' ? 'Inquiry closed.' : 'Inquiry reopened.');
    } catch (failure) { toast.error(getApiError(failure, 'Inquiry status could not be updated.').message); }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const updated = await siteContentService.replyToContactInquiry(selected.id, reply.trim());
      applyItem(updated);
      setReply('');
      toast.success('Reply sent.');
    } catch (failure) { toast.error(getApiError(failure, 'The reply could not be sent.').message); }
    finally { setSending(false); }
  }

  return <AdminShell><div className="mx-auto grid max-w-7xl gap-6">
    <header><p className="mb-2 text-xs font-semibold text-brand-600">Support</p><h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#1D1D1F] sm:text-3xl">Contact inquiries</h2><p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[#6E6E73]">Track messages submitted from the landing page and reply without leaving the admin dashboard.</p></header>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">{[['Total', data.counts.total ?? data.total], ['New', data.counts.new ?? 0], ['Read', data.counts.read ?? 0], ['Replied', data.counts.replied ?? 0], ['Closed', data.counts.closed ?? 0]].map(([label, value]) => <div className="rounded-2xl border border-[#E1E1E5] bg-white p-4" key={label}><p className="m-0 text-[11px] text-[#6E6E73]">{label}</p><p className="mb-0 mt-2 text-2xl font-semibold text-[#1D1D1F]">{value}</p></div>)}</section>
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter inquiries">{filters.map(([value, label]) => <button className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold ${filter === value ? 'border-brand-600 bg-brand-600 text-white' : 'border-[#D2D2D7] bg-white text-[#515154]'}`} key={label} type="button" onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className="grid min-h-[520px] overflow-hidden rounded-2xl border border-[#E1E1E5] bg-white lg:grid-cols-[minmax(280px,0.38fr)_minmax(0,0.62fr)]">
      <div className="border-b border-[#E1E1E5] lg:border-b-0 lg:border-r"><div className="border-b border-[#ECECEF] px-5 py-4 text-xs font-semibold text-[#515154]">{data.items.length} {data.items.length === 1 ? 'message' : 'messages'}</div><div className="max-h-[520px] overflow-y-auto">{loading ? <div className="m-4 h-28 animate-pulse rounded-xl bg-[#F5F5F7]" /> : data.items.length === 0 ? <p className="m-0 px-5 py-12 text-center text-sm text-[#86868B]">No inquiries in this view.</p> : data.items.map((inquiry) => <button className={`block w-full border-0 border-b border-[#ECECEF] px-5 py-4 text-left ${selectedId === inquiry.id ? 'bg-brand-50' : 'bg-white hover:bg-[#FAFAFB]'}`} key={inquiry.id} type="button" onClick={() => selectInquiry(inquiry)}><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold text-[#1D1D1F]">{inquiry.name}</span><StatusBadge status={inquiry.status} /></div><p className="mb-0 mt-1 truncate text-xs font-medium text-[#515154]">{inquiry.subject}</p><p className="mb-0 mt-1 line-clamp-2 text-[11px] leading-5 text-[#86868B]">{inquiry.message}</p><time className="mt-2 block text-[10px] text-[#86868B]">{new Date(inquiry.created_at).toLocaleString()}</time></button>)}</div></div>
      <div className="min-w-0 p-5 sm:p-7">{selected ? <div className="grid gap-6"><div className="flex flex-col gap-4 border-b border-[#ECECEF] pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="m-0 text-lg font-semibold text-[#1D1D1F]">{selected.subject}</h3><StatusBadge status={selected.status} /></div><p className="mb-0 mt-2 text-xs text-[#6E6E73]">From <strong className="text-[#3A3A3C]">{selected.name}</strong> · <a className="text-brand-700 hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></p></div><button className="min-h-10 shrink-0 rounded-lg border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#515154]" type="button" onClick={() => updateStatus(selected.status === 'closed' ? 'read' : 'closed')}>{selected.status === 'closed' ? 'Reopen' : 'Close inquiry'}</button></div><div><p className="whitespace-pre-wrap text-sm leading-7 text-[#3A3A3C]">{selected.message}</p><p className="mb-0 mt-4 text-[10px] text-[#86868B]">Received {new Date(selected.created_at).toLocaleString()} · Notification {selected.notification_status.replace('_', ' ')}</p></div>{selected.reply_message && <div className="rounded-xl border border-[#E1E1E5] bg-[#F7F7F8] p-4"><p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73]">Last reply</p><p className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-[#3A3A3C]">{selected.reply_message}</p></div>}<form className="grid gap-3 border-t border-[#ECECEF] pt-5" onSubmit={sendReply}><label className="text-xs font-semibold text-[#3A3A3C]" htmlFor="contact-reply">Reply by email</label><textarea className="min-h-36 resize-y rounded-xl border border-[#D2D2D7] bg-white p-3 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50" id="contact-reply" value={reply} maxLength={10000} placeholder={`Write a reply to ${selected.name}…`} required onChange={(event) => setReply(event.target.value)} /><div className="flex items-center justify-between gap-3"><p className="m-0 text-[10px] text-[#86868B]">Uses the Contact reply email template.</p><button className="min-h-10 rounded-lg bg-brand-600 px-5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" disabled={sending || !reply.trim()}>{sending ? 'Sending…' : 'Send reply'}</button></div></form></div> : <div className="grid min-h-[360px] place-items-center text-sm text-[#86868B]">Select an inquiry to view it.</div>}</div>
    </div>
  </div></AdminShell>;
}

function StatusBadge({ status }) {
  const style = status === 'new' ? 'bg-blue-50 text-blue-700' : status === 'replied' ? 'bg-emerald-50 text-emerald-700' : status === 'closed' ? 'bg-[#F2F2F4] text-[#6E6E73]' : 'bg-amber-50 text-amber-700';
  return <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${style}`}>{status}</span>;
}
