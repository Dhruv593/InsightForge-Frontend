import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { monitoringService } from '../services/monitoringService';
import { siteContentService } from '../services/siteContentService';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [blogs, setBlogs] = useState(null);
  const [legal, setLegal] = useState(null);
  const [contacts, setContacts] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([siteContentService.getAdminLanding(), monitoringService.overview(), siteContentService.listAdminBlogs(), siteContentService.getAdminLegal(), siteContentService.listContactInquiries()]).then(([contentResult, monitoringResult, blogsResult, legalResult, contactsResult]) => {
      if (!active) return;
      if (contentResult.status === 'fulfilled') setContent(contentResult.value);
      if (monitoringResult.status === 'fulfilled') setMonitoring(monitoringResult.value);
      if (blogsResult.status === 'fulfilled') setBlogs(blogsResult.value);
      if (legalResult.status === 'fulfilled') setLegal(legalResult.value);
      if (contactsResult.status === 'fulfilled') setContacts(contactsResult.value);
    });
    return () => { active = false; };
  }, []);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  return <AdminShell><div className="grid w-full gap-7">
    <header><p className="mb-2 text-xs font-semibold text-brand-600">Overview</p><h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#1D1D1F] sm:text-3xl">Welcome back, {user.name.split(' ')[0]}</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Manage Tatparya’s public content and keep an eye on system activity.</p></header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Landing page" value={content?.version ? 'Published' : 'Not published'} detail={content?.version ? `Version ${content.version}` : 'Using default content'} />
      <Metric label="Blog posts" value={blogs?.total ?? '—'} detail={`${blogs?.items?.filter((post) => post.status === 'published').length ?? 0} published`} />
      <Metric label="Registered users" value={monitoring?.summary?.total_users ?? '—'} detail="All accounts" />
      <Metric label="Active analyses" value={(monitoring?.summary?.queued_analyses ?? 0) + (monitoring?.summary?.running_analyses ?? 0)} detail="Queued and running" />
      <Metric label="Contact inquiries" value={contacts?.total ?? '—'} detail={`${contacts?.counts?.new ?? 0} new`} tone={(contacts?.counts?.new ?? 0) > 0 ? 'warning' : 'default'} />
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <DashboardCard title="Landing page" description="Update headings, actions, product screenshots, features, FAQs, and footer content.">
        <div className="flex flex-wrap gap-2"><Link className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700" to="/admin/landing-content">Edit landing page</Link><Link className="rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/?preview=1" target="_blank">View public site ↗</Link></div>
      </DashboardCard>
      <DashboardCard title="Blog posts" description="Create drafts and publish long-form articles without adding them to the landing page.">
        <div className="flex flex-wrap gap-2"><Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/admin/blogs">Manage posts</Link><Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/blog" target="_blank">View blog ↗</Link></div>
      </DashboardCard>
      <DashboardCard title="Legal pages" description="Keep the public privacy policy and terms accurate without changing application code.">
        <div className="flex flex-wrap gap-2"><Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/admin/legal-pages/privacy">Edit policies</Link><Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/privacy" target="_blank">View privacy ↗</Link></div>
        <p className="mb-0 mt-3 text-[11px] text-[#86868B]">{legal?.version ? `Published version ${legal.version}` : 'Application defaults active'}</p>
      </DashboardCard>
      <DashboardCard title="System monitoring" description="Review usage, provider reliability, agent activity, and recent analysis failures.">
        <Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/monitoring">Open monitoring</Link>
      </DashboardCard>
      <DashboardCard title="Email templates" description="Manage verification, password, payment, credit, and account notification copy.">
        <Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/admin/email-templates">Edit templates</Link>
      </DashboardCard>
      <DashboardCard title="Contact inquiries" description="Review landing-page messages, track their status, and reply by email.">
        <Link className="inline-flex rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/admin/contacts">Open inbox{contacts?.counts?.new ? ` · ${contacts.counts.new} new` : ''}</Link>
      </DashboardCard>
    </section>

    <section className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="m-0 text-base font-semibold">Publishing status</h3><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">{content?.updated_at ? `The landing page was last published ${new Date(content.updated_at).toLocaleString()}.` : 'The landing page is currently using the content bundled with the application.'}</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${content?.version ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}><span className={`h-2 w-2 rounded-full ${content?.version ? 'bg-emerald-500' : 'bg-amber-500'}`} />{content?.version ? 'Live' : 'Defaults active'}</span></div></section>
  </div></AdminShell>;
}

function Metric({ label, value, detail, tone = 'default' }) { return <article className="rounded-2xl border border-[#E1E1E5] bg-white p-5"><p className="m-0 text-xs font-medium text-[#6E6E73]">{label}</p><p className={`mb-0 mt-3 text-2xl font-semibold tracking-[-0.03em] tabular-nums ${tone === 'warning' ? 'text-amber-700' : 'text-[#1D1D1F]'}`}>{value}</p><p className="mb-0 mt-1 text-[11px] text-[#86868B]">{detail}</p></article>; }
function DashboardCard({ title, description, children }) { return <article className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><h3 className="m-0 text-base font-semibold tracking-[-0.02em]">{title}</h3><p className="mb-5 mt-2 max-w-lg text-xs leading-5 text-[#6E6E73]">{description}</p>{children}</article>; }
