import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BlogFooter, BlogHeader } from '../components/blog/BlogHeader';
import { Seo } from '../components/common/Seo';
import { siteContentService } from '../services/siteContentService';

export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [failed, setFailed] = useState(false);
  const [blogEnabled, setBlogEnabled] = useState(null);
  useEffect(() => {
    let active = true;
    setFailed(false); setPost(null);
    siteContentService.getLanding().then((landing) => {
      if (!active) return null;
      const enabled = landing.content?.blog?.enabled !== false;
      setBlogEnabled(enabled);
      return enabled ? siteContentService.getBlog(slug) : null;
    }).then((response) => { if (active && response) setPost(response); }).catch(() => { if (active) { setBlogEnabled(true); setFailed(true); } });
    return () => { active = false; };
  }, [slug]);
  if (blogEnabled === false) return <Navigate to="/" replace />;
  if (failed) return <div className="min-h-screen bg-[#F7F8FA]"><Seo title="Article not found — Tatparya" description="The requested Tatparya article could not be found." path={`/blog/${slug}`} noIndex /><BlogHeader /><main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 text-center"><div><h1 className="text-4xl font-bold">Article not found.</h1><Link className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white" to="/blog">Back to blog</Link></div></main><BlogFooter /></div>;
  if (!post) return <div className="min-h-screen bg-[#F7F8FA]"><BlogHeader /><main className="mx-auto max-w-3xl px-5 py-20"><div className="h-8 w-32 animate-pulse rounded bg-slate-200" /><div className="mt-6 h-28 animate-pulse rounded-xl bg-slate-200" /></main></div>;
  return <div className="min-h-screen bg-white text-slate-950"><Seo title={`${post.title} — Tatparya Blog`} description={post.excerpt} path={`/blog/${post.slug}`} /><BlogHeader /><article><header className="bg-[#F7F8FA]"><div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-20"><Link className="text-sm font-semibold text-brand-700" to="/blog">← All articles</Link><h1 className="mb-0 mt-6 text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-6xl">{post.title}</h1><p className="mx-auto mb-0 mt-6 max-w-2xl text-base leading-8 text-slate-600">{post.excerpt}</p><p className="mb-0 mt-6 text-xs font-medium text-slate-500">{post.author} · {new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(post.updated_at))}</p></div></header>{post.cover_image && <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-8"><img className="aspect-[16/9] w-full rounded-2xl object-cover" src={post.cover_image} alt={post.cover_alt || ''} /></div>}<div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">{post.sections.map((section, index) => <section className="mb-12 last:mb-0" key={`${section.heading}-${index}`}><h2 className="m-0 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{section.heading}</h2><div className="mt-5 grid gap-5">{section.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, paragraphIndex) => <p className="m-0 whitespace-pre-line text-base leading-8 text-slate-700" key={paragraphIndex}>{paragraph}</p>)}</div></section>)}</div></article><BlogFooter /></div>;
}
