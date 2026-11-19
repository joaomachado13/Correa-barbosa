import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { escapeHTML } from './html.mjs';
import { renderSolar } from './solar.mjs';

export { escapeHTML } from './html.mjs';
const reserved = new Set(['index', 'contato', 'orcamento', 'sobre', 'privacidade', 'solucoes']);

function validateImage(image, root, fail) {
  if (!image || typeof image.src !== 'string' || !/^assets\/images\/.+\.(webp|png|jpe?g|avif)$/i.test(image.src) || image.src.includes('\\') || image.src.split('/').includes('..') || typeof image.alt !== 'string' || !image.alt.trim()) fail('imagem deve ter src local em assets/images e alt descritivo.');
  if ((image.width !== undefined || image.height !== undefined) && !['width', 'height'].every(key => Number.isInteger(image[key]) && image[key] > 0)) fail('dimensões da imagem devem ser inteiros positivos.');
  const filename = path.join(root, image.src);
  if (!existsSync(filename) || !statSync(filename).isFile() || !realpathSync(filename).startsWith(realpathSync(root) + path.sep)) fail('arquivo de imagem ausente ou fora do projeto.');
}

export function validateFronts(registry, root) {
  if (registry?.versao !== 1 || !Array.isArray(registry.frentes) || !registry.frentes.length) throw new Error('Cadastro de frentes inválido: esperado versao 1 e lista não vazia.');
  const ids = new Set(), pages = new Set();
  for (const front of registry.frentes) {
    const fail = message => { throw new Error(`Frente ${front.id || '(sem id)'}: ${message}`); };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(front.id) || reserved.has(front.id)) fail('id deve ser um slug exclusivo, sem caminho e sem nome de página institucional.');
    if (ids.has(front.id) || pages.has(front.pagina)) fail('id ou página duplicados.');
    ids.add(front.id); pages.add(front.pagina);
    if (front.pagina !== `${front.id}.html`) fail('pagina deve corresponder a id.html.');
    if (!['rascunho', 'publicada'].includes(front.status)) fail('status deve ser rascunho ou publicada.');
    if (!['existente', 'servico'].includes(front.tipo)) fail('tipo deve ser existente ou servico.');
    if (typeof front.nome !== 'string' || !front.nome.trim()) fail('informe o nome.');
    if (!['resumo', 'introducao'].every(field => typeof front[field] === 'string')) fail('resumo e introducao devem ser textos.');
    if (!Array.isArray(front.grupos) || front.grupos.some(group => typeof group.titulo !== 'string' || !Array.isArray(group.itens) || group.itens.some(item => typeof item !== 'string' || !item.trim()))) fail('grupos devem conter titulo e itens de texto.');
    if (!Array.isArray(front.origens)) fail('origens deve ser uma lista de referências.');
    if (front.layout !== undefined && front.layout !== 'solar') fail('layout desconhecido.');
    if (front.tipo === 'existente' && !existsSync(path.join(root, front.pagina))) fail('a página existente não foi encontrada.');
    if (front.tipo === 'servico' && existsSync(path.join(root, front.pagina))) fail('a página gerada sobrescreveria um HTML da raiz.');
    if (front.imagem !== null) {
      validateImage(front.imagem, root, fail);
    }
    if (front.layout === 'solar') {
      const dimensions = image => image && ['width', 'height'].every(key => Number.isInteger(image[key]) && image[key] > 0);
      if (!dimensions(front.imagem)) fail('o destaque solar precisa de imagem com width e height positivos.');
      if (!Array.isArray(front.cases) || !front.cases.length) fail('informe os projetos solares reais.');
      const projects = new Set();
      for (const project of front.cases) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || projects.has(project.id)) fail('id de projeto solar inválido ou duplicado.');
        projects.add(project.id);
        if (!['nome', 'cidade'].every(key => typeof project[key] === 'string' && project[key].trim()) || !['Residencial', 'Comercial'].includes(project.tipo)) fail('projeto solar precisa de nome, cidade e tipo.');
        if (!Number.isFinite(project.potenciaKwp) || project.potenciaKwp <= 0) fail('a potência do projeto solar deve ser positiva, em kWp.');
        validateImage(project.imagem, root, fail);
        if (!dimensions(project.imagem)) fail('a foto do projeto solar precisa de width e height positivos.');
      }
    }
    if (front.status === 'publicada') {
      if (!front.resumo.trim() || !front.introducao.trim() || !front.imagem) fail('para publicar, preencha resumo, introducao e uma imagem real com alt.');
      if (front.tipo === 'servico' && (!front.grupos.length || front.grupos.some(group => !group.titulo.trim() || !group.itens.length))) fail('para publicar um serviço, preencha o escopo de cada grupo.');
    }
  }
  if (!registry.frentes.some(front => front.status === 'publicada')) throw new Error('Mantenha pelo menos uma frente publicada.');
  return registry.frentes;
}

export function selectFronts(registry, { preview = false } = {}) {
  return registry.frentes.filter(front => preview || front.status === 'publicada');
}

function photo(front) {
  return front.imagem
    ? `<img class="area-photo" src="${escapeHTML(front.imagem.src)}" alt="${escapeHTML(front.imagem.alt)}" width="${escapeHTML(front.imagem.width || 960)}" height="${escapeHTML(front.imagem.height || 640)}" loading="lazy">`
    : '<p class="area-placeholder">Prévia interna: selecione uma fotografia desta frente antes de publicá-la.</p>';
}

export function renderSolutions(fronts) {
  return `<section class="areas-intro section-spacing"><div class="container">
    <h1>Áreas de atuação</h1>
    <p>Conheça as soluções da CBE e encontre a área para sua demanda.</p>
  </div></section>
  <section class="section-spacing"><div class="container">
    ${fronts.map(front => `<article class="area-row" data-front="${escapeHTML(front.id)}">
      <div><h2>${escapeHTML(front.nome)}</h2><p>${escapeHTML(front.resumo)}</p>
      <a class="cbe-btn cbe-btn-blue" href="${escapeHTML(front.pagina)}">Conhecer ${escapeHTML(front.nome.toLowerCase())}</a>
      ${front.status === 'rascunho' ? '<p class="area-draft-label">Rascunho disponível apenas nesta prévia.</p>' : ''}</div>
      ${photo(front)}</article>`).join('\n')}
  </div></section>`;
}

export function renderFront(front) {
  if (front.layout === 'solar') return renderSolar(front);
  const contact = `contato.html?frente=${encodeURIComponent(front.id)}#contact-engineering-form`;
  return `<section class="areas-intro section-spacing"><div class="container">
    <nav class="areas-breadcrumb" aria-label="Você está aqui"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="solucoes.html">Áreas de atuação</a></nav>
    <h1>${escapeHTML(front.nome)}</h1><p>${escapeHTML(front.resumo)}</p>
  </div></section>
  <section class="section-spacing"><div class="container area-row">
    <div><h2>Como podemos ajudar</h2><p>${escapeHTML(front.introducao)}</p>
    <a class="cbe-btn cbe-btn-red" href="${contact}">Conversar sobre ${escapeHTML(front.nome.toLowerCase())}</a></div>
    ${photo(front)}
  </div></section>
  <section class="section-spacing"><div class="container area-groups">
    ${front.grupos.map(group => `<div><h2>${escapeHTML(group.titulo)}</h2><ul>${group.itens.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div>`).join('\n')}
  </div></section>
  <section class="section-spacing area-contact"><div class="container">
    <h2>Conte o que sua instalação precisa</h2><p>Compartilhe o objetivo e as informações que já possui. A equipe avalia o escopo com você.</p>
    <a class="cbe-btn cbe-btn-blue" href="${contact}">Falar com a equipe CBE</a>
  </div></section>`;
}

export function renderFrontSelect(fronts) {
  if (fronts.length < 2) return '';
  return `<div class="form-group"><label class="form-field-label" for="ct_frente">Área de atuação</label>
    <select class="input-styled" id="ct_frente" name="ct_frente"><option value="">Selecione a área...</option>
    ${fronts.map(front => `<option value="${escapeHTML(front.id)}">${escapeHTML(front.nome)}</option>`).join('\n')}</select></div>`;
}

export function pageShell(root, main, title, description, quoteHref = 'orcamento.html') {
  // The existing institutional page is the shared shell for new fronts.
  // Its established header/footer/widget keep the brand and existing interactions.
  const base = readFileSync(path.join(root, 'sobre.html'), 'utf8');
  const header = base.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
  const footer = base.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
  const widget = base.match(/<div class="floating-whatsapp-widget"[\s\S]*?(?=\s*<!--[^>]*-->\s*<script|\s*<script)/)?.[0];
  const nojs = base.match(/<noscript><nav class="nojs-nav"[\s\S]*?<\/noscript>/)?.[0];
  if (!header || !footer || !widget || !nojs) throw new Error('O layout institucional de sobre.html está incompleto.');
  const values = {
    TITLE: escapeHTML(title), DESCRIPTION: escapeHTML(description), MAIN: main,
    HEADER: header.replace('nav-link active', 'nav-link').replaceAll('href="orcamento.html"', `href="${escapeHTML(quoteHref)}"`),
    QUOTE_HREF: escapeHTML(quoteHref), FOOTER: footer, WIDGET: widget, NOJS_NAV: nojs
  };
  return readFileSync(path.join(root, 'templates/frente.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => values[key]);
}
