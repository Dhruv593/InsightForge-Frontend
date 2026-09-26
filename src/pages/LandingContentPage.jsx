import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { VisibilityToggle } from '../components/admin/landing/LandingEditorFields';
import { LandingSectionEditor } from '../components/admin/landing/LandingSectionEditor';
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
        <LandingSectionEditor activeSection={activeSection} content={content} update={update} uploading={uploading} uploadImage={uploadImage} uploadVideo={uploadVideo} uploadPoster={uploadPoster} addFaq={addFaq} removeFaq={removeFaq} moveSection={moveSection} visibleSectionOrder={visibleSectionOrder} repeatedThemePairs={repeatedThemePairs} orderedSections={orderedSections} />
        <div className="flex justify-end"><button className="rounded-lg bg-brand-600 px-5 py-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish changes'}</button></div>
      </form>}
    </div>
  </AdminShell>;
}
