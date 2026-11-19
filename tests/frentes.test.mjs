import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateFronts, selectFronts, renderSolutions, renderFront, renderFrontSelect, pageShell } from '../scripts/frentes.mjs';
import { renderHomeFronts, renderHomeOptions } from '../scripts/home.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const registry = () => JSON.parse(readFileSync(new URL('../assets/data/frentes.json', import.meta.url)));
function fixture() {
  const data = registry();
  // Unit fixtures are independent of how many fronts the team later publishes/adds.
  data.frentes = data.frentes.filter(front => ['quadros-eletricos', 'projetos-e-laudos', 'consultorias-e-comissionamento', 'instalacoes-eletricas', 'automacao', 'energia-fotovoltaica'].includes(front.id));
  data.frentes.forEach(front => { front.status = front.id === 'quadros-eletricos' ? 'publicada' : 'rascunho'; });
  data.frentes.find(front => front.id === 'projetos-e-laudos').imagem = null;
  return data;
}

test('cadastro mantém quadros ativos e só inclui outras frentes na prévia', () => {
  const data = fixture();
  assert.equal(validateFronts(data, root).length, 6);
  assert.deepEqual(selectFronts(data).map(front => front.id), ['quadros-eletricos']);
  assert.equal(selectFronts(data, { preview: true }).length, 6);
  assert.doesNotMatch(renderSolutions(selectFronts(data)), /projetos-e-laudos\.html/);
  assert.doesNotMatch(renderHomeFronts(selectFronts(data)), /projetos-e-laudos\.html/);
});

test('uma frente pode ser ativada isoladamente depois de completar seu conteúdo', () => {
  const data = fixture();
  const next = data.frentes.find(front => front.id === 'projetos-e-laudos');
  next.status = 'publicada';
  assert.throws(() => validateFronts(data, root), /imagem real/);
  // Test fixture only: a real publication must select a photograph of the specific service.
  next.imagem = data.frentes[0].imagem;
  validateFronts(data, root);
  const published = selectFronts(data);
  assert.deepEqual(published.map(front => front.id), ['quadros-eletricos', 'projetos-e-laudos']);
  assert.match(renderSolutions(published), /projetos-e-laudos\.html/);
  assert.doesNotMatch(renderSolutions(published), /automacao\.html/);
  const html = renderFront(next);
  assert.match(html, /contato\.html\?frente=projetos-e-laudos#contact-engineering-form/);
  assert.match(renderFrontSelect(published), /value="projetos-e-laudos"/);
  assert.match(renderHomeFronts(published), /data-home-front="projetos-e-laudos"/);
  assert.match(renderHomeOptions(published), /value="projetos-e-laudos"/);
});

test('validação rejeita colisão de páginas, caminhos e estados incorretos', () => {
  for (const alter of [
    data => { data.frentes[1].id = '../contato'; },
    data => { data.frentes[1].id = 'contato'; },
    data => { data.frentes[1].pagina = 'index.html'; },
    data => { data.frentes[1].status = 'publicado'; },
    data => { data.frentes[0].homeTitulo = ''; },
    data => { data.frentes[1].imagem = { src: 'assets/images/../../package.json', alt: 'Inválido' }; },
    data => { data.frentes[0].imagem.width = '960" onload="alert(1)'; },
    data => { data.frentes.push(structuredClone(data.frentes[0])); }
  ]) {
    const data = fixture(); alter(data);
    assert.throws(() => validateFronts(data, root));
  }
});

test('template escapa texto editorial e usa layout compartilhado', () => {
  const front = registry().frentes[1];
  front.nome = 'Projeto <script>alert(1)</script>';
  const html = pageShell(root, renderFront(front), front.nome, '"Conteúdo" & detalhes');
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&quot;Conteúdo&quot; &amp; detalhes/);
  assert.match(html, /id="main-nav-menu"/);
  assert.match(html, /id="whatsapp-widget"/);
  front.homeTitulo = 'Laudos <script>alert(1)</script>';
  assert.doesNotMatch(renderHomeFronts([front]), /<script>alert/);
  assert.match(renderHomeFronts([front]), /Laudos &lt;script&gt;/);
});

test('prévia gera rascunhos com noindex sem colocar as páginas no build público', () => {
  execFileSync(process.execPath, ['scripts/build.mjs', '--preview'], { cwd: root, env: { ...process.env, SITE_URL: 'https://fixture.example.test/' } });
  const preview = new URL('../dist-preview/', import.meta.url);
  assert.ok(existsSync(new URL('projetos-e-laudos.html', preview)));
  assert.equal(existsSync(new URL('sitemap.xml', preview)), false);
  assert.match(readFileSync(new URL('robots.txt', preview), 'utf8'), /Disallow: \//);
  const page = readFileSync(new URL('projetos-e-laudos.html', preview), 'utf8');
  assert.match(page, /content="noindex, nofollow"/);
  assert.doesNotMatch(page, /rel="canonical"/);
  assert.match(page, /Prévia interna/);
  assert.match(page, /Projeto de|Projetos e laudos/);
});

test('criar um rascunho duplicado falha sem alterar o cadastro', () => {
  const before = readFileSync(new URL('../assets/data/frentes.json', import.meta.url), 'utf8');
  assert.throws(() => execFileSync(process.execPath, ['scripts/frentes-cli.mjs', 'criar', 'quadros-eletricos', 'Duplicado'], { cwd: root, stdio: 'pipe' }));
  assert.equal(readFileSync(new URL('../assets/data/frentes.json', import.meta.url), 'utf8'), before);
});

test('frente solar usa fotos e dados reais com conteúdo editorial escapado', () => {
  const data = registry();
  validateFronts(data, root);
  const solar = data.frentes.find(front => front.layout === 'solar');
  assert.ok(selectFronts(data).some(front => front.id === solar.id));
  assert.ok(solar.cases.length >= 1);
  solar.cases[0].nome = '<script>cliente</script>';
  const html = renderFront(solar);
  assert.match(html, /&lt;script&gt;cliente&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>cliente/);
  assert.match(html, /id="solar-form"/);
  assert.match(html, /data-contact-form="um projeto de energia solar fotovoltaica"/);
  assert.match(html, /19,8 kWp/);
  assert.match(html, /loading="lazy"/);
});

test('frente solar rejeita galeria incompleta, potência inválida e imagem fora do projeto', () => {
  for (const alter of [
    front => { front.cases = []; },
    front => { front.cases[0].potenciaKwp = -1; },
    front => { front.cases[0].potenciaKwp = '19,8'; },
    front => { front.cases[0].imagem.src = 'assets/images/../../package.json'; },
    front => { front.cases[0].imagem.src = 'assets/images/solar/ausente.jpg'; },
    front => { front.cases[0].imagem.alt = ''; },
    front => { front.cases[0].imagem.width = 0; },
    front => { front.cases[0].cidade = ''; },
    front => { front.cases.push(structuredClone(front.cases[0])); },
    front => { front.layout = 'desconhecido'; }
  ]) {
    const data = registry();
    alter(data.frentes.find(front => front.id === 'energia-fotovoltaica'));
    assert.throws(() => validateFronts(data, root));
  }
});
