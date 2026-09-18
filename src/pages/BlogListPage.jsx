import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BlogFooter, BlogHeader } from '../components/blog/BlogHeader';
import { Seo } from '../components/common/Seo';
import { siteContentService } from '../services/siteContentService';

export function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [blogEnabled, setBlogEnabled] = useState(null);
  useEffect(() => {
    let active = true;
    siteContentService.getLanding().then((landing) => {
      if (!active) return null;
      const enabled = landing.content?.blog?.enabled !== false;
      setBlogEnabled(enabled);
      return enabled ? siteContentService.listBlogs() : null;
    }).then((response) => { if (active && response) setPosts(response.items ?? []); }).catch(() => { if (active) { setBlogEnabled(true); setFailed(true); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  if (blogEnabled === false) return <Navigate to="/" replace />;
  return <div className="min-h-screen bg-[#F7F8FA] text-slate-950"><Seo title="Tatparya Blog — Practical business data insights" description="Guides and perspectives for turning business data into clear, evidence-backed decisions." path="/blog" /><BlogHeader /><main className="mx-auto min-h-[calc(100vh-8rem)] max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12"><div className="max-w-3xl"><h1 className="m-0 text-4xl font-bold tracking-[-0.045em] sm:text-6xl">Ideas for making better decisions with data.</h1><p className="mb-0 mt-6 max-w-2xl text-base leading-8 text-slate-600">Practical guidance on analysis, reporting, and asking stronger questions of your business data.</p></div>
    {loading ? <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-72 animate-pulse rounded-2xl bg-white" key={item} />)}</div> : failed ? <div className="mt-14 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">Blog posts could not be loaded. Please try again later.</div> : posts.length ? <section className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Blog posts">{posts.map((post) => <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5" key={post.slug}>{post.cover_image ? <Link to={`/blog/${post.slug}`}><img className="aspect-[16/9] w-full object-cover" src={post.cover_image} alt={post.cover_alt || ''} loading="lazy" decoding="async" /></Link> : <div className="aspect-[16/9] bg-[#0E1726]" />}<div className="p-6"><p className="m-0 text-xs font-medium text-slate-500">{formatDate(post.updated_at)} · {post.author}</p><h2 className="mb-0 mt-3 text-xl font-semibold tracking-[-0.025em]"><Link className="hover:text-brand-700" to={`/blog/${post.slug}`}>{post.title}</Link></h2><p className="mb-0 mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p><Link className="mt-5 inline-flex text-sm font-semibold text-brand-700" to={`/blog/${post.slug}`}>Read article →</Link></div></article>)}</section> : <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="m-0 text-xl font-semibold">Articles are on the way.</h2><p className="mb-0 mt-2 text-sm text-slate-500">Check back soon for practical data analysis guides.</p></div>}
  </main><BlogFooter /></div>;
}

function formatDate(value) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)); }
