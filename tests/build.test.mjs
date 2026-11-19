import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

test('build usa o domínio informado; sem domínio não publica endereços inventados', () => {
  // Reserved test domain: generated output is never deployed by the tests.
  execFileSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_URL: 'https://cbe.example.test/site/' } });
  const html = readFileSync('dist/orcamento.html', 'utf8');
  assert.match(html, /rel="canonical" href="https:\/\/cbe\.example\.test\/site\/orcamento.html"/);
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data['@type'], 'LocalBusiness');
  assert.equal(data.address.addressLocality, 'Uberlândia');
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  assert.equal((sitemap.match(/<url>/g) || []).length, 6);
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /https:\/\/cbe\.example\.test\/site\/sitemap.xml/);
  assert.ok(existsSync('dist/assets/fonts/inter.woff2'));
  assert.ok(existsSync('dist/assets/vendor/swup.min.js'));
  execFileSync(process.execPath, ['scripts/build.mjs'], { env: { ...process.env, SITE_URL: '' } });
  assert.equal(existsSync('dist/sitemap.xml'), false);
  assert.doesNotMatch(readFileSync('dist/index.html', 'utf8'), /rel="canonical"|example\.test/);
});
