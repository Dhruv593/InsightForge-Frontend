import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const clone = (value) => JSON.parse(JSON.stringify(value));

export function LandingContentPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(() => clone(defaultLandingContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [meta, setMeta] = useState({ version: 0, updated_at: null });
  const { section } = useParams();
  const sections = ['navigation', 'hero', 'how-it-works', 'preview', 'platform', 'faq', 'closing', 'footer'];
  const activeSection = sections.includes(section) ? section : 'navigation';
  const contentKey = activeSection === 'how-it-works' ? 'how_it_works' : activeSection;
  const sectionTitles = { navigation: 'Navbar', hero: 'Hero', 'how-it-works': 'How it works', preview: 'Product preview', platform: 'Platform features', faq: 'Frequently asked questions', closing: 'Closing call to action', footer: 'Footer' };

  useEffect(() => {
    let active = true;
    siteContentService.getAdminLanding()
      .then((response) => {
        if (!active) return;
        setContent(clone(normalizeLandingContent(response.content)));
        setMeta({ version: response.version, updated_at: response.updated_at });
      })
      .catch((error) => toast.error(getApiError(error, 'Landing content could not be loaded.').message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

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

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await siteContentService.updateLanding(content);
      setContent(clone(normalizeLandingContent(response.content)));
      setMeta({ version: response.version, updated_at: response.updated_at });
      toast.success('Landing page published.');
    } catch (error) {
      toast.error(getApiError(error, 'Landing page could not be published.').message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(index, file) {
    if (!file) return;
    const key = `preview-${index}`;
    setUploading(key);
    try {
      const result = await siteContentService.uploadImage(file);
      update(`preview.steps.${index}.image`, result.url);
      toast.success('Image uploaded. Publish to show it on the landing page.');
    } catch (error) {
      toast.error(getApiError(error, 'Image could not be uploaded.').message);
    } finally {
      setUploading('');
    }
  }

  function addFaq() {
    if (content.faq.items.length >= 12) return;
    update('faq.items', [...content.faq.items, { question: 'New question', answer: 'Add a clear answer.' }]);
  }

  function removeFaq(index) {
    if (content.faq.items.length <= 1) return;
    update('faq.items', content.faq.items.filter((_, itemIndex) => itemIndex !== index));
  }

  return <AdminShell>
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold text-brand-600">Landing page</p><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">{sectionTitles[activeSection]}</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Edit this section and publish when it is ready.</p></div>
        <div className="flex items-center gap-2"><Link className="rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/?preview=1" target="_blank">View page ↗</Link><button className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" form="landing-content-form" disabled={saving || loading}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
      </header>
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#86868B]"><span>Version {meta.version || 'not published'}</span>{meta.updated_at && <span>Last published {new Date(meta.updated_at).toLocaleString()}</span>}</div>
      {loading ? <div className="h-64 animate-pulse rounded-2xl bg-white" /> : <form id="landing-content-form" className="grid gap-5" onSubmit={save}>
        <VisibilityToggle enabled={content[contentKey].enabled} onChange={(value) => update(`${contentKey}.enabled`, value)} section={sectionTitles[activeSection]} />
        {activeSection === 'navigation' && <EditorSection title="Navigation" description="Control the public navigation labels and primary action.">
          <div className="grid gap-3 sm:grid-cols-2">{content.navigation.links.map((link, index) => <LinkFields key={index} title={`Navigation link ${index + 1}`} value={link} path={`navigation.links.${index}`} update={update} />)}</div>
          <Field label="Login label" value={content.navigation.login_label} onChange={(value) => update('navigation.login_label', value)} />
          <LinkFields title="Navigation action" value={content.navigation.action} path="navigation.action" update={update} />
        </EditorSection>}

        {activeSection === 'hero' && <EditorSection title="Hero" description="The first message, process graphic, and actions visitors see.">
          <TwoColumns><Field label="Headline" value={content.hero.title} onChange={(value) => update('hero.title', value)} /><Field label="Headline accent" value={content.hero.accent} onChange={(value) => update('hero.accent', value)} /></TwoColumns>
          <LinkFields title="Primary action" value={content.hero.primary_action} path="hero.primary_action" update={update} /><LinkFields title="Secondary action" value={content.hero.secondary_action} path="hero.secondary_action" update={update} />
          <CardsEditor title="Process steps" items={content.hero.process_items} basePath="hero.process_items" update={update} detailKey="detail" />
          <Field label="Process footer" value={content.hero.process_footer} onChange={(value) => update('hero.process_footer', value)} />
        </EditorSection>}

        {activeSection === 'how-it-works' && <EditorSection title="How it works" description="Explain the product’s value and the three core outcomes.">
          <TwoColumns><Field label="Heading" value={content.how_it_works.title} onChange={(value) => update('how_it_works.title', value)} /><Field label="Heading accent" value={content.how_it_works.accent} onChange={(value) => update('how_it_works.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.how_it_works.description} onChange={(value) => update('how_it_works.description', value)} />
          <div className="grid gap-3 sm:grid-cols-3">{content.how_it_works.flow_labels.map((label, index) => <Field key={index} label={`Flow label ${index + 1}`} value={label} onChange={(value) => update(`how_it_works.flow_labels.${index}`, value)} />)}</div>
          <CardsEditor title="Outcome cards" items={content.how_it_works.cards} basePath="how_it_works.cards" update={update} />
        </EditorSection>}

        {activeSection === 'preview' && <EditorSection title="Product preview" description="Manage the walkthrough copy and screenshots.">
          <TwoColumns><Field label="Heading" value={content.preview.title} onChange={(value) => update('preview.title', value)} /><Field label="Heading accent" value={content.preview.accent} onChange={(value) => update('preview.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.preview.description} onChange={(value) => update('preview.description', value)} />
          <div className="grid gap-3 sm:grid-cols-3"><Field label="Workspace label" value={content.preview.workspace_label} onChange={(value) => update('preview.workspace_label', value)} /><Field label="Helper text" value={content.preview.helper_text} onChange={(value) => update('preview.helper_text', value)} /><Field label="Preview button" value={content.preview.open_label} onChange={(value) => update('preview.open_label', value)} /></div>
          <div className="grid gap-4">{content.preview.steps.map((step, index) => <div className="rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-4" key={index}><h3 className="mb-4 mt-0 text-sm font-semibold">Preview {index + 1}</h3><div className="grid gap-3 lg:grid-cols-2"><Field label="Title" value={step.title} onChange={(value) => update(`preview.steps.${index}.title`, value)} /><Field label="Image description" value={step.alt} onChange={(value) => update(`preview.steps.${index}.alt`, value)} /><Field multiline label="Description" value={step.description} onChange={(value) => update(`preview.steps.${index}.description`, value)} /><div className="grid content-start gap-2"><Field label="Image path or HTTPS URL" value={step.image} onChange={(value) => update(`preview.steps.${index}.image`, value)} /><label className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F7F7F8]">{uploading === `preview-${index}` ? 'Uploading…' : 'Upload image'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={Boolean(uploading)} onChange={(event) => uploadImage(index, event.target.files?.[0])} /></label></div></div>{step.image && <img className="mt-4 max-h-48 w-full rounded-lg border border-[#E1E1E5] bg-white object-contain" src={step.image} alt="" loading="lazy" decoding="async" />}</div>)}</div>
        </EditorSection>}

        {activeSection === 'platform' && <EditorSection title="Platform features" description="Describe the four capabilities shown in the dark section.">
          <TwoColumns><Field label="Heading" value={content.platform.title} onChange={(value) => update('platform.title', value)} /><Field label="Heading accent" value={content.platform.accent} onChange={(value) => update('platform.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.platform.description} onChange={(value) => update('platform.description', value)} />
          <LinkFields title="Section action" value={content.platform.action} path="platform.action" update={update} />
          <CardsEditor title="Feature cards" items={content.platform.cards} basePath="platform.cards" update={update} />
        </EditorSection>}

        {activeSection === 'faq' && <EditorSection title="Frequently asked questions" description="Keep answers concise and useful for first-time visitors.">
          <TwoColumns><Field label="Heading" value={content.faq.title} onChange={(value) => update('faq.title', value)} /><Field label="Heading accent" value={content.faq.accent} onChange={(value) => update('faq.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.faq.description} onChange={(value) => update('faq.description', value)} />
          <div className="grid gap-3">{content.faq.items.map((item, index) => <div className="grid gap-3 rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-4" key={index}><div className="flex items-center justify-between"><span className="text-xs font-semibold">FAQ {index + 1}</span><button className="border-0 bg-transparent text-xs font-medium text-red-600 disabled:opacity-40" type="button" disabled={content.faq.items.length <= 1} onClick={() => removeFaq(index)}>Remove</button></div><Field label="Question" value={item.question} onChange={(value) => update(`faq.items.${index}.question`, value)} /><Field multiline label="Answer" value={item.answer} onChange={(value) => update(`faq.items.${index}.answer`, value)} /></div>)}</div>
          <button className="w-fit rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40" type="button" disabled={content.faq.items.length >= 12} onClick={addFaq}>+ Add question</button>
        </EditorSection>}

        {activeSection === 'closing' && <EditorSection title="Closing call to action" description="The final prompt shown above the footer.">
          <Field label="Heading" value={content.closing.title} onChange={(value) => update('closing.title', value)} />
          <LinkFields title="Action" value={content.closing.action} path="closing.action" update={update} />
          <Field label="Supporting note" value={content.closing.note} onChange={(value) => update('closing.note', value)} />
        </EditorSection>}
        {activeSection === 'footer' && <EditorSection title="Footer" description="Control the final navigation and copyright wording.">
          <LinkFields title="Preview link" value={content.footer.preview_link} path="footer.preview_link" update={update} />
          <TwoColumns><Field label="Login label" value={content.footer.login_label} onChange={(value) => update('footer.login_label', value)} /><Field label="Copyright name" value={content.footer.copyright_name} onChange={(value) => update('footer.copyright_name', value)} /></TwoColumns>
        </EditorSection>}
        <div className="flex justify-end"><button className="rounded-lg bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
      </form>}
    </div>
  </AdminShell>;
}

function EditorSection({ title, description, children }) { return <section className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="mb-5 border-b border-[#ECECEF] pb-4"><h2 className="m-0 text-lg font-semibold tracking-[-0.02em]">{title}</h2><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">{description}</p></div><div className="grid gap-4">{children}</div></section>; }
function VisibilityToggle({ enabled, onChange, section }) { return <section className="flex items-center justify-between gap-5 rounded-2xl border border-[#E1E1E5] bg-white p-5"><div><h3 className="m-0 text-sm font-semibold">Show {section}</h3><p className="mb-0 mt-1 text-xs text-[#6E6E73]">{enabled ? 'This section is visible on the public landing page.' : 'This section is hidden from the public landing page.'}</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${enabled ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-6' : 'left-1'}`} /></button></section>; }
function TwoColumns({ children }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }
function Field({ label, value, onChange, multiline = false }) { const Component = multiline ? 'textarea' : 'input'; return <label className="grid gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className={`w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${multiline ? 'min-h-24 resize-y leading-6' : 'min-h-10'}`} value={value} onChange={(event) => onChange(event.target.value)} required /></label>; }
function LinkFields({ title, value, path, update }) { return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><TwoColumns><Field label="Button label" value={value.label} onChange={(next) => update(`${path}.label`, next)} /><Field label="Destination (/path, #section, or https://)" value={value.href} onChange={(next) => update(`${path}.href`, next)} /></TwoColumns></fieldset>; }
function CardsEditor({ title, items, basePath, update, detailKey = 'description' }) { return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><div className="grid gap-3 lg:grid-cols-3">{items.map((item, index) => <div className="grid gap-3 rounded-lg bg-[#FAFAFB] p-3" key={index}><Field label={`Item ${index + 1} title`} value={item.title ?? item.label} onChange={(value) => update(`${basePath}.${index}.${item.title === undefined ? 'label' : 'title'}`, value)} /><Field multiline label="Description" value={item[detailKey]} onChange={(value) => update(`${basePath}.${index}.${detailKey}`, value)} /></div>)}</div></fieldset>; }
