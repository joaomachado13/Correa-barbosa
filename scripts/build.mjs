import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './vendor.mjs';
import { validateFronts, selectFronts, renderSolutions, renderFront, renderFrontSelect, pageShell } from './frentes.mjs';
import { renderHomeFronts, renderHomeOptions } from './home.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--preview');
const output = path.join(root, preview ? 'dist-preview' : 'dist');
const registry = JSON.parse(await readFile(path.join(root, 'assets/data/frentes.json'), 'utf8'));
validateFronts(registry, root);
const fronts = selectFronts(registry, { preview });
const rawURL = process.env.SITE_URL;
let site;
if (rawURL && !preview) {
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
if (pages.includes('solucoes.html')) throw new Error('solucoes.html é uma página gerada; edite o cadastro de frentes e o template.');
const generated = new Map([
  ['solucoes.html', pageShell(root, renderSolutions(fronts), 'Áreas de atuação | CBE Engenharia', 'Conheça as áreas de atuação da Corrêa Barbosa Engenharia e fale com a equipe sobre sua demanda.')],
  ...fronts.filter(front => front.tipo === 'servico').map(front => [front.pagina, pageShell(root, renderFront(front), `${front.nome} | CBE Engenharia`, front.resumo, front.layout === 'solar' ? '#analise-solar' : `contato.html?frente=${encodeURIComponent(front.id)}#contact-engineering-form`)])
]);
pages.push(...generated.keys());
// Public output contains only the released registry. Drafts stay in the source/preview.
await writeFile(path.join(output, 'assets/data/frentes.json'), JSON.stringify({ versao: 1, frentes: fronts.map(({ origens, ...front }) => front) }, null, 2) + '\n');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const urls = [];
const homeContent = await readFile(path.join(root, 'templates/home-main.html'), 'utf8');
for (const page of pages) {
  let html = generated.get(page) ?? await readFile(path.join(root, page), 'utf8');
  html = html.replace('<!-- CBE:HOME-CONTENT -->', homeContent);
  html = html.replace('<!-- CBE:FRONT-SELECT -->', renderFrontSelect(fronts));
  html = html.replace('<!-- CBE:HOME-FRONTS -->', renderHomeFronts(fronts));
  html = html.replace('<!-- CBE:HOME-FRONT-OPTIONS -->', renderHomeOptions(fronts));
  if (preview) {
    html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow">\n</head>');
    html = html.replace(/(<main\b[^>]*>)/, '$1\n<div class="area-preview-note" role="note">Prévia interna: inclui frentes em rascunho. Use o build normal para publicar.</div>');
  }
  if (site) {
    const canonical = new URL(page === 'index.html' ? './' : page, site).href;
    urls.push(canonical);
    const business = {
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      '@id': `${site.href}#empresa`, name: 'Corrêa Barbosa Engenharia',
      url: site.href, telephone: '+55-34-99922-7667', email: 'contato@cbeengenharia.com.br',
      address: { '@type': 'PostalAddress', streetAddress: 'R. Carmo Gifoni, 951, Martins', addressLocality: 'Uberlândia', addressRegion: 'MG', postalCode: '38400-358', addressCountry: 'BR' }
    };
    const front = fronts.find(front => front.pagina === page);
    const shareImage = front?.imagem?.src || (page === 'index.html' ? 'assets/logo/logo-cbe-principal.webp' : 'contents/images/hero-cbe-final-1440.webp');
    const shareAlt = front?.imagem?.alt || (page === 'index.html' ? 'Corrêa Barbosa Engenharia — engenharia elétrica, quadros e energia solar' : 'Quadros elétricos da Corrêa Barbosa Engenharia');
    const structured = front?.tipo === 'servico' ? { '@context': 'https://schema.org', '@type': 'Service', name: front.nome, description: front.resumo, url: canonical, provider: business } : business;
    html = html.replace('</head>', `  <link rel="canonical" href="${escape(canonical)}">\n  <meta property="og:url" content="${escape(canonical)}">\n  <meta property="og:image" content="${escape(new URL(shareImage, site).href)}">\n  <meta property="og:image:alt" content="${escape(shareAlt)}">\n  <script type="application/ld+json">${JSON.stringify(structured).replaceAll('<', '\\u003c')}</script>\n</head>`);
  }
  await writeFile(path.join(output, page), html);
}
if (site) {
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', site).href}\n`);
} else if (preview) {
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  console.log('Prévia de rascunhos: noindex em todas as páginas e sem sitemap de publicação.');
} else {
  console.log('Domínio ainda não definido: canonical, sitemap e dados locais serão gerados quando SITE_URL for informado.');
}
console.log(`Site estático gerado em ${preview ? 'dist-preview' : 'dist'}/ (${pages.length} páginas; ${fronts.length} frentes).`);
