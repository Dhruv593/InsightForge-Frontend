import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { defaultLegalContent, normalizeLegalContent } from '../content/legalContent';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function AdminLegalPagesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { page } = useParams();
  const activePage = page === 'terms' ? 'terms' : 'privacy';
  const [content, setContent] = useState(() => clone(defaultLegalContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ version: 0, updated_at: null });

  useEffect(() => {
    let active = true;
    siteContentService.getAdminLegal()
      .then((response) => {
        if (!active) return;
        setContent(clone(normalizeLegalContent(response.content)));
        setMeta({ version: response.version, updated_at: response.updated_at });
      })
      .catch((error) => toast.error(getApiError(error, 'Legal pages could not be loaded.').message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  const document = content[activePage];
  const publicPath = activePage === 'privacy' ? '/privacy' : '/terms';

  function update(path, value) {
    setContent((current) => {
      const next = clone(current);
      const segments = path.split('.');
      let target = next;
      segments.slice(0, -1).forEach((segment) => { target = target[segment]; });
      target[segments.at(-1)] = value;
      return next;
    });
  }

  function addSection() {
    if (document.sections.length >= 24) return;
    update(`${activePage}.sections`, [...document.sections, { heading: 'New section', paragraphs: ['Add the section details.'] }]);
  }

  function removeSection(index) {
    if (document.sections.length <= 1) return;
    update(`${activePage}.sections`, document.sections.filter((_, itemIndex) => itemIndex !== index));
  }

  function addParagraph(sectionIndex) {
    const section = document.sections[sectionIndex];
    if (section.paragraphs.length >= 12) return;
    update(`${activePage}.sections.${sectionIndex}.paragraphs`, [...section.paragraphs, 'Add another paragraph.']);
  }

  function removeParagraph(sectionIndex, paragraphIndex) {
    const section = document.sections[sectionIndex];
    if (section.paragraphs.length <= 1) return;
    update(`${activePage}.sections.${sectionIndex}.paragraphs`, section.paragraphs.filter((_, itemIndex) => itemIndex !== paragraphIndex));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await siteContentService.updateLegal(content);
      setContent(clone(normalizeLegalContent(response.content)));
      setMeta({ version: response.version, updated_at: response.updated_at });
      toast.success('Legal pages published.');
    } catch (error) {
      toast.error(getApiError(error, 'Legal pages could not be published.').message);
    } finally {
      setSaving(false);
    }
  }

  return <AdminShell><div className="mx-auto max-w-5xl">
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0"><p className="mb-2 text-xs font-semibold text-brand-600">Legal pages</p><h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#1D1D1F] sm:text-3xl">{document.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-[#6E6E73]">Edit the public policy content and publish both legal pages together.</p></div>
      <div className="grid grid-cols-2 gap-2 sm:flex"><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D2D2D7] bg-white px-3 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to={publicPath} target="_blank">View page ↗</Link><button className="min-h-11 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" form="legal-content-form" disabled={saving || loading}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
    </header>
    <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#6E6E73]"><span>Version {meta.version || 'not published'}</span>{meta.updated_at && <span>Last published {new Date(meta.updated_at).toLocaleString()}</span>}</div>
    {loading ? <div className="h-64 animate-pulse rounded-2xl bg-white" /> : <form id="legal-content-form" className="grid gap-4" onSubmit={save}>
      <section className="grid gap-4 rounded-2xl border border-[#E1E1E5] bg-white p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Page title" value={document.title} onChange={(value) => update(`${activePage}.title`, value)} /><Field label="Effective date" value={document.effective_date} onChange={(value) => update(`${activePage}.effective_date`, value)} /></div>
        <Field multiline label="Search description" value={document.description} onChange={(value) => update(`${activePage}.description`, value)} />
        <Field multiline label="Introduction" value={document.introduction} onChange={(value) => update(`${activePage}.introduction`, value)} />
      </section>
      {document.sections.map((section, sectionIndex) => <section className="rounded-2xl border border-[#E1E1E5] bg-white p-4 sm:p-6" key={sectionIndex}>
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ECECEF] pb-4"><h3 className="m-0 text-sm font-semibold">Section {sectionIndex + 1}</h3><button className="min-h-10 rounded-lg border-0 bg-transparent px-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40" type="button" disabled={document.sections.length <= 1} onClick={() => removeSection(sectionIndex)}>Remove section</button></div>
        <div className="grid gap-3"><Field label="Heading" value={section.heading} onChange={(value) => update(`${activePage}.sections.${sectionIndex}.heading`, value)} />{section.paragraphs.map((paragraph, paragraphIndex) => <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" key={paragraphIndex}><Field multiline label={`Paragraph ${paragraphIndex + 1}`} value={paragraph} onChange={(value) => update(`${activePage}.sections.${sectionIndex}.paragraphs.${paragraphIndex}`, value)} /><button className="min-h-11 rounded-xl border border-red-100 bg-white px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40" type="button" disabled={section.paragraphs.length <= 1} onClick={() => removeParagraph(sectionIndex, paragraphIndex)}>Remove</button></div>)}<button className="min-h-11 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8] sm:w-fit" type="button" disabled={section.paragraphs.length >= 12} onClick={() => addParagraph(sectionIndex)}>+ Add paragraph</button></div>
      </section>)}
      <div className="grid gap-2 sm:flex sm:justify-between"><button className="min-h-11 rounded-xl border border-[#D2D2D7] bg-white px-4 text-xs font-semibold disabled:opacity-40" type="button" disabled={document.sections.length >= 24} onClick={addSection}>+ Add section</button><button className="min-h-11 rounded-xl bg-brand-600 px-5 text-xs font-semibold text-white disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
    </form>}
  </div></AdminShell>;
}

function Field({ label, value, onChange, multiline = false }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="grid min-w-0 gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className={`w-full min-w-0 rounded-xl border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${multiline ? 'min-h-24 resize-y leading-6' : 'min-h-11'}`} value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}
