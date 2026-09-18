import { useEffect } from 'react';

const defaultDescription = 'Upload business data, ask questions in plain language, and turn verified analysis into clear decisions with Tatparya.';

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export function Seo({ title = 'Tatparya — Ask better questions of your data', description = defaultDescription, path = '/', noIndex = false }) {
  useEffect(() => {
    const canonicalUrl = new globalThis.URL(path, window.location.origin).toString();
    const imageUrl = new globalThis.URL('/analysis-preview.png', window.location.origin).toString();
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex,nofollow' : 'index,follow');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:image"]', 'content', imageUrl);
    setMeta('meta[property="og:image:alt"]', 'content', 'Tatparya business data analysis dashboard');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', imageUrl);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, noIndex, path, title]);
  return null;
}
