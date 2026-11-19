import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './vendor.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const rawURL = process.env.SITE_URL;
let site;
if (rawURL) {
  site = new URL(rawURL);
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) {
    throw new Error('SITE_URL deve ser uma URL HTTPS pública, sem credenciais, query ou fragmento.');
  }
  site.pathname = site.pathname.replace(/\/?$/, '/');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const directory of ['assets', 'css', 'js', 'contents/images']) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const urls = [];
for (const page of pages) {
  let html = await readFile(path.join(root, page), 'utf8');
  if (site) {
    const canonical = new URL(page === 'index.html' ? './' : page, site).href;
    urls.push(canonical);
    const business = {
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      '@id': `${site.href}#empresa`, name: 'Corrêa Barbosa Engenharia',
      url: site.href, telephone: '+55-34-99922-7667', email: 'contato@cbeengenharia.com.br',
      address: { '@type': 'PostalAddress', streetAddress: 'R. Carmo Gifoni, 951, Martins', addressLocality: 'Uberlândia', addressRegion: 'MG', postalCode: '38400-358', addressCountry: 'BR' }
    };
    html = html.replace('</head>', `  <link rel="canonical" href="${escape(canonical)}">\n  <meta property="og:url" content="${escape(canonical)}">\n  <meta property="og:image" content="${escape(new URL('contents/images/hero-cbe-final-1440.webp', site).href)}">\n  <meta property="og:image:alt" content="Quadros elétricos da Corrêa Barbosa Engenharia">\n  <script type="application/ld+json">${JSON.stringify(business).replaceAll('<', '\\u003c')}</script>\n</head>`);
  }
  await writeFile(path.join(output, page), html);
}
if (site) {
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', site).href}\n`);
} else {
  console.log('Domínio ainda não definido: canonical, sitemap e dados locais serão gerados quando SITE_URL for informado.');
}
console.log(`Site estático gerado em dist/ (${pages.length} páginas).`);
