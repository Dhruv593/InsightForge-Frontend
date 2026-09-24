import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const clone = (value) => JSON.parse(JSON.stringify(value));
const orderedSections = [
  ['hero', 'Hero'],
  ['how_it_works', 'How it works'],
  ['preview', 'Product preview'],
  ['platform', 'Platform'],
  ['video', 'Tutorial video'],
  ['faq', 'FAQ'],
  ['contact', 'Contact'],
  ['closing', 'Closing CTA'],
];

export function LandingContentPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(() => clone(defaultLandingContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [meta, setMeta] = useState({ version: 0, updated_at: null });
  const { section } = useParams();
  const sections = ['navigation', 'layout', 'hero', 'how-it-works', 'preview', 'platform', 'video', 'faq', 'contact', 'closing', 'footer'];
  const activeSection = sections.includes(section) ? section : 'navigation';
  const contentKey = activeSection === 'how-it-works' ? 'how_it_works' : activeSection;
  const sectionTitles = { navigation: 'Navbar', layout: 'Layout & colors', hero: 'Hero', 'how-it-works': 'How it works', preview: 'Product preview', platform: 'Platform features', faq: 'Frequently asked questions', video: 'Tutorial video', contact: 'Contact', closing: 'Closing call to action', footer: 'Footer' };

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

  async function uploadVideo(file) {
    if (!file) return;
    setUploading('tutorial-video');
    try {
      const result = await siteContentService.uploadVideo(file);
      update('video.video_url', result.url);
      toast.success('Tutorial video uploaded. Publish to show it on the landing page.');
    } catch (error) {
      toast.error(getApiError(error, 'Tutorial video could not be uploaded.').message);
    } finally {
      setUploading('');
    }
  }

  async function uploadPoster(file) {
    if (!file) return;
    setUploading('tutorial-poster');
    try {
      const result = await siteContentService.uploadImage(file);
      update('video.poster_url', result.url);
      toast.success('Video poster uploaded.');
    } catch (error) {
      toast.error(getApiError(error, 'Video poster could not be uploaded.').message);
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

  function moveSection(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= content.section_order.length) return;
    const next = [...content.section_order];
    [next[index], next[destination]] = [next[destination], next[index]];
    update('section_order', next);
  }

  const visibleSectionOrder = content.section_order.filter((section) => content[section].enabled && (section !== 'video' || content.video.video_url));
  const repeatedThemePairs = visibleSectionOrder.slice(1).flatMap((section, index) => {
    const previous = visibleSectionOrder[index];
    if (content[previous].theme !== content[section].theme) return [];
    const previousTitle = orderedSections.find(([key]) => key === previous)?.[1] || previous;
    const title = orderedSections.find(([key]) => key === section)?.[1] || section;
    return [`${previousTitle} and ${title}`];
  });

  return <AdminShell>
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold text-brand-600">Landing page</p><h2 className="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#1D1D1F] sm:text-3xl">{sectionTitles[activeSection]}</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Edit this section and publish when it is ready.</p></div>
        <div className="grid grid-cols-2 gap-2 sm:flex"><Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-semibold text-[#3A3A3C] hover:bg-[#F7F7F8]" to="/?preview=1" target="_blank">View page ↗</Link><button className="min-h-11 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" form="landing-content-form" disabled={saving || loading}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
      </header>
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#86868B]"><span>Version {meta.version || 'not published'}</span>{meta.updated_at && <span>Last published {new Date(meta.updated_at).toLocaleString()}</span>}</div>
      {loading ? <div className="h-64 animate-pulse rounded-2xl bg-white" /> : <form id="landing-content-form" className="grid gap-5" onSubmit={save}>
        {activeSection !== 'layout' && <VisibilityToggle enabled={content[contentKey].enabled} onChange={(value) => update(`${contentKey}.enabled`, value)} section={sectionTitles[activeSection]} />}
        {activeSection === 'navigation' && <EditorSection title="Navigation" description="Control the public navigation labels and primary action.">
          <div className="grid gap-3 sm:grid-cols-2">{content.navigation.links.map((link, index) => <LinkFields key={index} title={`Navigation link ${index + 1}`} value={link} path={`navigation.links.${index}`} update={update} />)}</div>
          <Field label="Login label" value={content.navigation.login_label} onChange={(value) => update('navigation.login_label', value)} />
          <LinkFields title="Navigation action" value={content.navigation.action} path="navigation.action" update={update} />
        </EditorSection>}

        {activeSection === 'layout' && <EditorSection title="Section order and colors" description="Arrange the landing-page flow and choose a coordinated light or dark palette for each section.">
          <div className="rounded-xl border border-[#E1E1E5] bg-white p-4"><div className="flex items-center justify-between gap-4"><div><h3 className="m-0 text-xs font-semibold text-[#1D1D1F]">Visible color flow</h3><p className="mb-0 mt-1 text-[11px] text-[#86868B]">Updates as sections are reordered, hidden, or recolored.</p></div><div className="flex min-w-0 flex-1 justify-end gap-1.5" aria-label="Landing-page color flow">{visibleSectionOrder.map((section) => <span className={`h-7 min-w-4 flex-1 rounded-md border ${content[section].theme === 'dark' ? 'border-[#26344B] bg-[#0E1726]' : 'border-[#DADAE0] bg-[#F7F9FC]'}`} key={section} title={`${orderedSections.find(([key]) => key === section)?.[1]}: ${content[section].theme}`} />)}</div></div></div>
          {repeatedThemePairs.length > 0 && <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">Consider alternating these adjacent sections for a clearer transition: {repeatedThemePairs.join('; ')}.</p>}
          <div className="grid gap-3">{content.section_order.map((section, index) => {
            const title = orderedSections.find(([key]) => key === section)?.[1] || section;
            return <div className="grid gap-3 rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={section}>
              <div className="flex min-w-0 items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[11px] font-semibold text-[#6E6E73] shadow-sm">{index + 1}</span><div className="min-w-0"><p className="m-0 truncate text-sm font-semibold text-[#1D1D1F]">{title}</p><p className="mb-0 mt-0.5 text-[11px] text-[#86868B]">{content[section].enabled ? 'Visible' : 'Hidden'}</p></div></div>
              <ThemeSelect value={content[section].theme} onChange={(value) => update(`${section}.theme`, value)} />
              <div className="grid grid-cols-2 gap-1"><button className="grid h-10 w-10 place-items-center rounded-lg border border-[#D2D2D7] bg-white text-sm disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label={`Move ${title} up`} disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button><button className="grid h-10 w-10 place-items-center rounded-lg border border-[#D2D2D7] bg-white text-sm disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label={`Move ${title} down`} disabled={index === content.section_order.length - 1} onClick={() => moveSection(index, 1)}>↓</button></div>
            </div>;
          })}</div>
          <p className="m-0 rounded-xl bg-brand-50 px-4 py-3 text-[11px] leading-5 text-brand-800">Light and dark themes automatically adjust headings, body copy, borders, cards, and buttons to preserve contrast.</p>
        </EditorSection>}

        {activeSection === 'hero' && <EditorSection title="Hero" description="The first message, process graphic, and actions visitors see.">
          <TwoColumns><Field label="Headline" value={content.hero.title} onChange={(value) => update('hero.title', value)} /><Field label="Headline accent" value={content.hero.accent} onChange={(value) => update('hero.accent', value)} /></TwoColumns>
          <SettingToggle enabled={content.hero.motion_enabled !== false} onChange={(value) => update('hero.motion_enabled', value)} title="Animate the process graphic" description="Repeat the Upload, Ask, Decide sequence. Reduced-motion preferences still disable it automatically." />
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
          <div className="grid gap-3 sm:grid-cols-3">{content.preview.steps.map((step, index) => <Field key={index} label={`Tab ${index + 1} label`} value={step.label} onChange={(value) => update(`preview.steps.${index}.label`, value)} />)}</div>
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

        {activeSection === 'video' && <EditorSection title="Tutorial video" description="Upload and describe the tutorial shown near the bottom of the landing page.">
          <TwoColumns><Field label="Heading" value={content.video.title} onChange={(value) => update('video.title', value)} /><Field label="Heading accent" value={content.video.accent} onChange={(value) => update('video.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.video.description} onChange={(value) => update('video.description', value)} />
          <Field label="Video caption" value={content.video.caption} onChange={(value) => update('video.caption', value)} />
          <div className="grid gap-4 lg:grid-cols-2"><div className="grid content-start gap-2"><Field label="Video path or HTTPS URL" value={content.video.video_url || ''} required={content.video.enabled} onChange={(value) => update('video.video_url', value)} /><label className="inline-flex min-h-11 w-fit cursor-pointer items-center rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-semibold hover:bg-[#F7F7F8]">{uploading === 'tutorial-video' ? 'Uploading video…' : 'Upload video'}<input className="sr-only" type="file" accept="video/mp4,video/webm,video/quicktime" disabled={Boolean(uploading)} onChange={(event) => uploadVideo(event.target.files?.[0])} /></label><span className="text-[10px] text-[#86868B]">MP4, WebM, or MOV. Maximum 100 MB.</span></div><div className="grid content-start gap-2"><Field label="Poster image path or HTTPS URL" value={content.video.poster_url || ''} required={false} onChange={(value) => update('video.poster_url', value)} /><label className="inline-flex min-h-11 w-fit cursor-pointer items-center rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-semibold hover:bg-[#F7F7F8]">{uploading === 'tutorial-poster' ? 'Uploading poster…' : 'Upload poster image'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploading)} onChange={(event) => uploadPoster(event.target.files?.[0])} /></label></div></div>
          {content.video.video_url && <video className="aspect-video w-full rounded-xl border border-[#E1E1E5] bg-black" controls preload="metadata" poster={content.video.poster_url || undefined}><source src={content.video.video_url} /></video>}
        </EditorSection>}

        {activeSection === 'contact' && <EditorSection title="Contact" description="Manage the contact information, form labels, delivery address, and confirmation message.">
          <TwoColumns><Field label="Heading" value={content.contact.title} onChange={(value) => update('contact.title', value)} /><Field label="Heading accent" value={content.contact.accent} onChange={(value) => update('contact.accent', value)} /></TwoColumns>
          <Field multiline label="Description" value={content.contact.description} onChange={(value) => update('contact.description', value)} />
          <TwoColumns><Field label="Form heading" value={content.contact.form_title} onChange={(value) => update('contact.form_title', value)} /><Field label="Submit button" value={content.contact.submit_label} onChange={(value) => update('contact.submit_label', value)} /><Field label="Public email" value={content.contact.email} onChange={(value) => update('contact.email', value)} /><Field label="Form recipient email" value={content.contact.recipient_email} onChange={(value) => update('contact.recipient_email', value)} /><Field label="Phone or availability" value={content.contact.phone} onChange={(value) => update('contact.phone', value)} /><Field label="Location" value={content.contact.address} onChange={(value) => update('contact.address', value)} /></TwoColumns>
          <Field label="Success message" value={content.contact.success_message} onChange={(value) => update('contact.success_message', value)} />
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
function SettingToggle({ enabled, onChange, title, description }) { return <div className="flex items-center justify-between gap-5 rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-4"><div><h3 className="m-0 text-xs font-semibold">{title}</h3><p className="mb-0 mt-1 text-[11px] leading-5 text-[#6E6E73]">{description}</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${enabled ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-label={title} aria-checked={enabled} onClick={() => onChange(!enabled)}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-6' : 'left-1'}`} /></button></div>; }
function ThemeSelect({ value, onChange }) { return <label className="grid min-w-32 gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">Background<select className="min-h-10 rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#3A3A3C] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={value || 'light'} onChange={(event) => onChange(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label>; }
function TwoColumns({ children }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }
function Field({ label, value, onChange, multiline = false, required = true }) { const Component = multiline ? 'textarea' : 'input'; return <label className="grid gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className={`w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${multiline ? 'min-h-24 resize-y leading-6' : 'min-h-10'}`} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>; }
function LinkFields({ title, value, path, update }) { return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><TwoColumns><Field label="Button label" value={value.label} onChange={(next) => update(`${path}.label`, next)} /><Field label="Destination (/path, #section, or https://)" value={value.href} onChange={(next) => update(`${path}.href`, next)} /></TwoColumns></fieldset>; }
function CardsEditor({ title, items, basePath, update, detailKey = 'description' }) { return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><div className="grid gap-3 lg:grid-cols-3">{items.map((item, index) => <div className="grid gap-3 rounded-lg bg-[#FAFAFB] p-3" key={index}><Field label={`Item ${index + 1} title`} value={item.title ?? item.label} onChange={(value) => update(`${basePath}.${index}.${item.title === undefined ? 'label' : 'title'}`, value)} /><Field multiline label="Description" value={item[detailKey]} onChange={(value) => update(`${basePath}.${index}.${detailKey}`, value)} /></div>)}</div></fieldset>; }
