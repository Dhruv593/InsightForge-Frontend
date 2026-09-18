import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rawHost = process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'http://localhost:5173';
const origin = new URL(rawHost.startsWith('http') ? rawHost : `https://${rawHost}`).origin;
const output = resolve('dist');
await mkdir(output, { recursive: true });

const publicPaths = ['/', '/blog', '/privacy', '/terms'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPaths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /account
Disallow: /admin
Disallow: /monitoring
Disallow: /reset-password
Disallow: /verify-email
Sitemap: ${origin}/sitemap.xml
`;

await Promise.all([
  writeFile(resolve(output, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(resolve(output, 'robots.txt'), robots, 'utf8'),
]);
const indexPath = resolve(output, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const productionHtml = indexHtml
  .replaceAll('content="/analysis-preview.png"', `content="${origin}/analysis-preview.png"`)
  .replace('</head>', `    <meta property="og:url" content="${origin}/" />\n    <link rel="canonical" href="${origin}/" />\n  </head>`);
await writeFile(indexPath, productionHtml, 'utf8');
console.log(`Generated robots.txt and sitemap.xml for ${origin}`);
