import { escapeHTML as e } from './html.mjs';

export function renderHomeFronts(fronts) {
  return fronts.map(front => `<a class="home-front" href="${e(front.pagina)}" data-home-front="${e(front.id)}">
    ${front.imagem ? `<img src="${e(front.imagem.src)}" alt="${e(front.imagem.alt)}" width="${e(front.imagem.width || 960)}" height="${e(front.imagem.height || 640)}" ${front.id === 'quadros-eletricos' ? 'fetchpriority="high"' : 'decoding="async"'}>` : '<div class="home-front-placeholder">Fotografia em preparação</div>'}
    <div class="home-front-copy"><h2>${e(front.homeTitulo || front.nome)}</h2><p>${e(front.resumo)}</p><span class="home-front-action">Ver detalhes <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
    ${front.status === 'rascunho' ? '<span class="home-draft">Rascunho nesta prévia</span>' : ''}</div>
  </a>`).join('\n');
}

export function renderHomeOptions(fronts) {
  return fronts.map(front => `<option value="${e(front.id)}">${e(front.nome)}</option>`).join('\n');
}
