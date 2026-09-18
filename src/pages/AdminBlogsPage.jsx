import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiError } from '../services/api';
import { siteContentService } from '../services/siteContentService';

const emptyPost = () => ({ slug: '', status: 'draft', title: '', excerpt: '', author: 'Tatparya team', cover_image: '', cover_alt: '', sections: [{ heading: 'Introduction', body: '' }] });
const toSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 160);

export function AdminBlogsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [editor, setEditor] = useState(emptyPost);
  const [originalSlug, setOriginalSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [landingContent, setLandingContent] = useState(null);
  const [visibilityBusy, setVisibilityBusy] = useState(false);

  const loadPosts = useCallback(async () => {
    try { const response = await siteContentService.listAdminBlogs(); setPosts(response.items ?? []); }
    catch (error) { toast.error(getApiError(error, 'Blog posts could not be loaded.').message); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    loadPosts();
    siteContentService.getAdminLanding()
      .then((response) => setLandingContent(normalizeLandingContent(response.content || defaultLandingContent)))
      .catch((error) => toast.error(getApiError(error, 'Blog visibility could not be loaded.').message));
  }, [loadPosts, toast]);
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  function update(key, value) { setEditor((current) => ({ ...current, [key]: value })); }
  function updateTitle(value) { setEditor((current) => ({ ...current, title: value, slug: slugEdited ? current.slug : toSlug(value) })); }
  function updateSection(index, key, value) { setEditor((current) => ({ ...current, sections: current.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [key]: value } : section) })); }
  function newPost() { setEditor(emptyPost()); setOriginalSlug(''); setSlugEdited(false); }

  async function selectPost(slug) {
    setBusy(`load-${slug}`);
    try {
      const post = await siteContentService.getAdminBlog(slug);
      setEditor({ slug: post.slug, status: post.status, title: post.title, excerpt: post.excerpt, author: post.author, cover_image: post.cover_image || '', cover_alt: post.cover_alt || '', sections: post.sections });
      setOriginalSlug(post.slug); setSlugEdited(true);
    } catch (error) { toast.error(getApiError(error, 'Blog post could not be opened.').message); }
    finally { setBusy(''); }
  }

  async function save(event) {
    event.preventDefault(); setBusy('save');
    const payload = { slug: editor.slug, status: editor.status, content: { title: editor.title, excerpt: editor.excerpt, author: editor.author, cover_image: editor.cover_image || null, cover_alt: editor.cover_alt || null, sections: editor.sections } };
    try {
      const post = originalSlug ? await siteContentService.updateBlog(originalSlug, payload) : await siteContentService.createBlog(payload);
      setOriginalSlug(post.slug); setSlugEdited(true); await loadPosts(); toast.success(post.status === 'published' ? 'Blog post published.' : 'Draft saved.');
    } catch (error) { toast.error(getApiError(error, 'Blog post could not be saved.').message); }
    finally { setBusy(''); }
  }

  async function uploadCover(file) {
    if (!file) return; setBusy('image');
    try { const response = await siteContentService.uploadImage(file); update('cover_image', response.url); toast.success('Cover image uploaded.'); }
    catch (error) { toast.error(getApiError(error, 'Cover image could not be uploaded.').message); }
    finally { setBusy(''); }
  }

  async function removePost() {
    if (!originalSlug || !globalThis.confirm('Delete this blog post permanently?')) return;
    setBusy('delete');
    try { await siteContentService.deleteBlog(originalSlug); newPost(); await loadPosts(); toast.success('Blog post deleted.'); }
    catch (error) { toast.error(getApiError(error, 'Blog post could not be deleted.').message); }
    finally { setBusy(''); }
  }

  async function toggleBlogVisibility() {
    if (!landingContent || visibilityBusy) return;
    const next = { ...landingContent, blog: { ...landingContent.blog, enabled: landingContent.blog?.enabled === false } };
    setVisibilityBusy(true);
    try {
      const response = await siteContentService.updateLanding(next);
      setLandingContent(normalizeLandingContent(response.content || next));
      toast.success(next.blog.enabled ? 'Blog is now visible.' : 'Blog is now hidden from the public site.');
    } catch (error) { toast.error(getApiError(error, 'Blog visibility could not be updated.').message); }
    finally { setVisibilityBusy(false); }
  }

  return <AdminShell><div className="mx-auto max-w-7xl"><header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold text-brand-600">Content management</p><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em]">Blog posts</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Write, preview, and publish articles for the separate blog.</p></div><div className="flex gap-2"><Link className="rounded-lg border border-[#D2D2D7] bg-white px-4 py-2.5 text-xs font-semibold" to="/blog" target="_blank">View blog ↗</Link><button className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white" type="button" onClick={newPost}>New post</button></div></header>
    <section className="mb-5 flex items-center justify-between gap-5 rounded-2xl border border-[#E1E1E5] bg-white p-5"><div><h3 className="m-0 text-sm font-semibold">Public blog</h3><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">When hidden, the Blog link is removed from the landing page and public blog URLs redirect home.</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition disabled:opacity-50 ${landingContent?.blog?.enabled !== false ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-label="Show public blog" aria-checked={landingContent?.blog?.enabled !== false} disabled={!landingContent || visibilityBusy} onClick={toggleBlogVisibility}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${landingContent?.blog?.enabled !== false ? 'left-6' : 'left-1'}`} /></button></section>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]"><aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-[#E1E1E5] bg-white p-3 xl:sticky xl:top-20"><div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">All posts</div>{loading ? <div className="h-24 animate-pulse rounded-xl bg-[#F5F5F7]" /> : posts.length ? <div className="grid min-w-0 gap-1">{posts.map((post) => <button className={`w-full min-w-0 overflow-hidden rounded-xl border-0 p-3 text-left ${originalSlug === post.slug ? 'bg-brand-50' : 'bg-transparent hover:bg-[#F5F5F7]'}`} type="button" key={post.slug} onClick={() => selectPost(post.slug)} disabled={busy === `load-${post.slug}`}><span className="block break-words text-xs font-semibold leading-5">{post.title}</span><span className={`mt-1 block text-[10px] capitalize ${post.status === 'published' ? 'text-emerald-700' : 'text-amber-700'}`}>{post.status}</span></button>)}</div> : <p className="m-2 text-xs leading-5 text-[#86868B]">No blog posts yet.</p>}</aside>
      <form className="grid min-w-0 gap-5" onSubmit={save}><section className="min-w-0 rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between border-b border-[#ECECEF] pb-4"><div className="min-w-0"><h3 className="m-0 text-lg font-semibold">{originalSlug ? 'Edit article' : 'New article'}</h3><p className="mb-0 mt-1 text-xs text-[#6E6E73]">Only published posts appear publicly.</p></div><select className="shrink-0 rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold" value={editor.status} onChange={(event) => update('status', event.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div><div className="grid min-w-0 gap-4"><Field label="Title" value={editor.title} onChange={updateTitle} maxLength={160} /><Field label="URL slug" value={editor.slug} onChange={(value) => { setSlugEdited(true); update('slug', toSlug(value)); }} maxLength={160} hint="Lowercase letters, numbers, and hyphens." /><Field multiline label="Excerpt" value={editor.excerpt} onChange={(value) => update('excerpt', value)} maxLength={1200} /><Field label="Author" value={editor.author} onChange={(value) => update('author', value)} maxLength={160} /><div className="grid min-w-0 gap-3 sm:grid-cols-2"><Field label="Cover image URL" value={editor.cover_image} onChange={(value) => update('cover_image', value)} required={false} /><Field label="Cover image alt text" value={editor.cover_alt} onChange={(value) => update('cover_alt', value)} required={Boolean(editor.cover_image)} /></div><label className="inline-flex w-fit cursor-pointer rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F7F7F8]">{busy === 'image' ? 'Uploading…' : 'Upload cover image'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => uploadCover(event.target.files?.[0])} disabled={Boolean(busy)} /></label>{editor.cover_image && <img className="max-h-72 w-full rounded-xl border border-[#E1E1E5] object-cover" src={editor.cover_image} alt="" />}</div></section>
        <section className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="m-0 text-lg font-semibold">Article sections</h3><p className="mb-0 mt-1 text-xs text-[#6E6E73]">Separate paragraphs with a blank line.</p></div><button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-semibold" type="button" onClick={() => update('sections', [...editor.sections, { heading: 'New section', body: '' }])}>+ Add section</button></div><div className="grid gap-4">{editor.sections.map((section, index) => <div className="rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-4" key={index}><div className="mb-3 flex justify-between"><span className="text-xs font-semibold">Section {index + 1}</span><button className="border-0 bg-transparent text-xs font-medium text-red-600 disabled:opacity-40" type="button" disabled={editor.sections.length === 1} onClick={() => update('sections', editor.sections.filter((_, sectionIndex) => sectionIndex !== index))}>Remove</button></div><div className="grid gap-3"><Field label="Heading" value={section.heading} onChange={(value) => updateSection(index, 'heading', value)} maxLength={160} /><Field multiline rows={8} label="Content" value={section.body} onChange={(value) => updateSection(index, 'body', value)} maxLength={20000} /></div></div>)}</div></section>
        <div className="flex items-center justify-between"><button className="text-xs font-semibold text-red-600 disabled:opacity-40" type="button" onClick={removePost} disabled={!originalSlug || Boolean(busy)}>Delete post</button><button className="rounded-lg bg-brand-600 px-5 py-3 text-xs font-semibold text-white disabled:opacity-50" type="submit" disabled={Boolean(busy) || !editor.slug}>{busy === 'save' ? 'Saving…' : editor.status === 'published' ? 'Publish post' : 'Save draft'}</button></div>
      </form></div>
  </div></AdminShell>;
}

function Field({ label, value, onChange, multiline = false, rows = 4, maxLength, required = true, hint }) { const Component = multiline ? 'textarea' : 'input'; return <label className="grid min-w-0 gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className="min-w-0 w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal leading-6 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={value} onChange={(event) => onChange(event.target.value)} rows={multiline ? rows : undefined} maxLength={maxLength} required={required} />{hint && <span className="text-[10px] font-normal text-[#86868B]">{hint}</span>}</label>; }
