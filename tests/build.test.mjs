import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

test('build usa o domínio informado; sem domínio não publica endereços inventados', () => {
  const fronts = JSON.parse(readFileSync('assets/data/frentes.json')).frentes;
  const published = fronts.filter(front => front.status === 'publicada');
  const pageCount = readdirSync('.').filter(name => name.endsWith('.html')).length + 1 + published.filter(front => front.tipo === 'servico').length;
  // Reserved test domain: generated output is never deployed by the tests.
  execFileSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_URL: 'https://cbe.example.test/site/' } });
  const html = readFileSync('dist/orcamento.html', 'utf8');
  assert.match(html, /rel="canonical" href="https:\/\/cbe\.example\.test\/site\/orcamento.html"/);
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data['@type'], 'LocalBusiness');
  assert.equal(data.address.addressLocality, 'Uberlândia');
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  assert.equal((sitemap.match(/<url>/g) || []).length, pageCount);
  assert.match(sitemap, /solucoes.html/);
  for (const front of fronts.filter(front => front.status === 'rascunho')) assert.ok(!sitemap.includes(front.pagina));
  for (const front of published.filter(front => front.tipo === 'servico')) {
    const servicePage = readFileSync(`dist/${front.pagina}`, 'utf8');
    const service = JSON.parse(servicePage.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(service['@type'], 'Service');
    assert.equal(service.name, front.nome);
    assert.equal(service.url, `https://cbe.example.test/site/${front.pagina}`);
    assert.ok(sitemap.includes(service.url));
    assert.ok(servicePage.includes(`https://cbe.example.test/site/${front.imagem.src}`));
  }
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /https:\/\/cbe\.example\.test\/site\/sitemap.xml/);
  assert.ok(existsSync('dist/assets/fonts/inter.woff2'));
  assert.ok(existsSync('dist/assets/vendor/swup.min.js'));
  execFileSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_URL: '' } });
  assert.equal(existsSync('dist/sitemap.xml'), false);
  assert.doesNotMatch(readFileSync('dist/index.html', 'utf8'), /rel="canonical"|example\.test/);
  for (const front of fronts.filter(front => front.status === 'rascunho')) assert.equal(existsSync(`dist/${front.pagina}`), false);
  for (const front of published) assert.ok(existsSync(`dist/${front.pagina}`));
  assert.deepEqual(JSON.parse(readFileSync('dist/assets/data/frentes.json')).frentes.map(front => front.id), published.map(front => front.id));
});
