import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fronts = JSON.parse(readFileSync('assets/data/frentes.json', 'utf8')).frentes;
const routes = ['index', 'quadros-eletricos', 'sobre', 'orcamento', 'contato', 'privacidade', 'solucoes', ...fronts.filter(front => front.status === 'publicada' && front.tipo === 'servico').map(front => front.id)];
test.use({ reducedMotion: 'reduce' });
async function open(page, route) {
  await page.goto(`/${route}.html`, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [1440, 901, 390, 320]) {
  test(`rotas, fontes locais e formulários dentro da tela em ${width}px`, async ({ page }) => {
    const errors = [], failed = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', r => failed.push(r.url()));
    page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:8010/')) external.push(r.url()); });
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await open(page, route);
      expect(await page.evaluate(() => document.fonts.check('16px "Inter"') && document.fonts.check('16px "Space Grotesk"'))).toBe(true);
      const outside = await page.locator('form input, form select, form textarea, form button, .contact-info-col, .contact-form-surface').evaluateAll(elements => elements.filter(el => {
        const r = el.getBoundingClientRect();
        return r.width && el.getClientRects().length && (r.left < -1 || r.right > innerWidth + 1);
      }).map(el => el.id || el.className));
      expect(outside, route).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (route === 'contato') {
        expect(await page.locator('label').first().evaluate(el => getComputedStyle(el).color)).not.toBe('rgb(255, 255, 255)');
        expect(await page.locator('.form-channel-note').evaluate(el => getComputedStyle(el).color)).not.toBe('rgb(255, 255, 255)');
      }
      if (route === 'index') expect(await page.locator('.home-contact-form h3').evaluate(el => getComputedStyle(el).color)).not.toBe('rgb(255, 255, 255)');
    }
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    expect(external).toEqual([]);
  });
}

test('formulário prepara a mensagem, rejeita telefone inválido e preserva os dados', async ({ page }) => {
  await open(page, 'contato');
  const form = page.locator('form');
  await page.locator('#ct_nome').fill('José & Maria');
  await page.locator('#ct_email').fill('teste@example.com');
  await page.locator('#ct_telefone').fill('abc');
  await page.locator('#ct_mensagem').fill('Preciso de quadro 380V / 50 kVA <teste>');
  await page.getByRole('button', { name: 'CCM & Motores', exact: true }).click();
  await form.locator('[type=submit]').click();
  expect(await page.locator('#ct_telefone').evaluate(e => e.checkValidity())).toBe(false);
  await expect(form.locator('.form-feedback')).toBeHidden();
  await page.locator('#ct_telefone').fill('(34) 99922-7667');
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await form.locator('[type=submit]').click();
  await expect(form.getByRole('status')).toContainText('ainda não foi enviada');
  await expect(page.locator('#ct_nome')).toHaveValue('José & Maria');
  const url = new URL(await form.locator('.whatsapp-continue').getAttribute('href'));
  expect(url.pathname).toBe('/5534999227667');
  expect(url.searchParams.get('text')).toContain('José & Maria');
  expect(url.searchParams.get('text')).toContain('CCM');
  expect(url.searchParams.get('text')).toContain('380V / 50 kVA <teste>');
  expect(requests).toEqual([]); // Tests never open or send messages to WhatsApp.
  await page.locator('#ct_nome').fill('Nome corrigido');
  await expect(form.locator('.form-feedback')).toBeHidden();
  await expect(form.locator('.whatsapp-continue')).not.toHaveAttribute('href');
});

test('orçamento técnico, formulário da home e catálogo geram o conteúdo correto', async ({ page }) => {
  const cases = [
    { route: 'index', fields: { nome_cta: 'Teste', email_cta: 'teste@example.com', tel_cta: '34999227667', desc_cta: 'Sistema solar para residência' }, select: { home_frente: 'energia-fotovoltaica' }, expected: 'Sistema solar para residência' },
    { route: 'quadros-eletricos', fields: { 'cat-nome': 'Teste', 'cat-telefone': '34999227667', 'cat-detalhes': 'Diagrama e proteção' } },
    { route: 'orcamento', fields: { tec_nome: 'Teste', tec_email: 'teste@example.com', tec_telefone: '34999227667', tec_observacoes: 'Diagrama e proteção' }, select: { tec_tipo_quadro: 'CCM', tec_tensao: '380/220V' } }
  ];
  for (const item of cases) {
    await open(page, item.route);
    for (const [id, value] of Object.entries(item.fields)) await page.locator(`[id="${id}"]`).fill(value);
    for (const [id, value] of Object.entries(item.select || {})) await page.locator(`#${id}`).selectOption(value);
    const form = page.locator('form:visible').first();
    await form.locator('[type=submit]').click();
    await expect(form.locator('.form-feedback')).toBeVisible();
    const message = new URL(await form.locator('.whatsapp-continue').getAttribute('href')).searchParams.get('text');
    expect(message).toContain(item.expected || 'Diagrama e proteção');
    if (item.route === 'index') expect(message).toContain('Energia solar fotovoltaica');
  }
});

test('seleção por teclado e orientação guiada em três etapas conservam os dados', async ({ page }) => {
  await open(page, 'orcamento');
  const guided = page.locator('[data-flow=guiado]');
  await guided.focus();
  await page.keyboard.press('Enter');
  await expect(guided).toHaveAttribute('aria-pressed', 'true');
  const form = page.locator('form[data-guided]');
  await expect(form.locator('.guided-progress')).toHaveText('Etapa 1 de 3');
  await form.locator('.guided-next').click();
  await expect(form.locator('.guided-progress')).toHaveText('Etapa 1 de 3');
  await page.locator('#gui_local').selectOption('industria');
  await form.locator('.guided-next').click();
  await page.locator('#gui_objetivo').selectOption('nova_instalacao');
  await page.locator('#gui_cargas').fill('Duas bombas de 5 CV');
  await form.locator('.guided-next').click();
  await form.locator('.guided-prev').click();
  await expect(page.locator('#gui_cargas')).toHaveValue('Duas bombas de 5 CV');
  await form.locator('.guided-next').click();
  for (const [id, value] of Object.entries({ gui_nome: 'Teste', gui_email: 'teste@example.com', gui_telefone: '34999227667', gui_cidade: 'Uberlândia/MG' })) await page.locator(`#${id}`).fill(value);
  await form.locator('[type=submit]').click();
  const message = new URL(await form.locator('.whatsapp-continue').getAttribute('href')).searchParams.get('text');
  expect(message).toContain('Indústria / Galpão Fabril');
  expect(message).toContain('Duas bombas de 5 CV');
  expect(message).toContain('Uberlândia/MG');
});

test('filtro e especificações operam pelo teclado sem focar faces ocultas', async ({ page }) => {
  await open(page, 'quadros-eletricos');
  await expect(page.locator('.catalog-family-guide')).not.toHaveAttribute('open');
  await page.locator('.catalog-family-guide summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.catalog-family-guide')).toHaveAttribute('open');
  await page.locator('.family-action-link').first().click();
  await expect(page.locator('.cbe-compact-card:visible')).toHaveCount(2);
  const filter = page.locator('.catalog-filter-btn[data-filter=ccm]');
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.cbe-compact-card:visible')).toHaveCount(3);
  expect(await filter.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  const card = page.locator('.cbe-compact-card:visible').first();
  const cue = card.locator('.cbe-flip-cue');
  await cue.focus();
  await page.keyboard.press('Enter');
  await expect(cue).toHaveAttribute('aria-expanded', 'true');
  await expect(card.locator('.flip-return')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(cue).toHaveAttribute('aria-expanded', 'false');
  await expect(cue).toBeFocused();
  expect(await card.locator('.cbe-compact-back').evaluate(el => el.inert)).toBe(true);
});

test('menu móvel retém foco, fecha com Escape e widget continua funcionando após visitas Swup', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'index');
  const toggle = page.locator('#mobile-toggle-btn');
  for (const route of ['sobre', 'contato', 'sobre', 'contato']) {
    await toggle.click();
    await expect(page.locator('#main-nav-menu a').first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await page.locator(`#main-nav-menu a[href="${route}.html"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${route}.html$`));
    await expect(page.locator('#swup')).toBeFocused();
    await page.locator('#toggle-whatsapp-widget').click();
    await expect(page.locator('#whatsapp-widget')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#whatsapp-widget')).not.toHaveClass(/is-open/);
  }
});

test('redução de movimento mantém a home estável e permite escolher uma frente', async ({ page }) => {
  await open(page, 'index');
  await expect(page.locator('#cbe-splash-screen')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await page.locator('[data-home-front="energia-fotovoltaica"]').click();
  await expect(page.locator('h1')).toContainText('Painéis solares');
});

test('conteúdo e contato alternativo permanecem disponíveis sem JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/index.html');
  await expect(page.locator('#cbe-splash-screen')).toBeHidden();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-home-front]')).toHaveCount(fronts.filter(front => front.status === 'publicada').length);
  await expect(page.locator('.nojs-nav')).toBeVisible();
  await expect(page.locator('form noscript a')).toBeVisible();
  await expect(page.locator('form button[type=submit]')).toBeDisabled();
  await context.close();
});

test('axe e revisão de contraste nas páginas, nas duas faces e no fluxo guiado', async ({ page }) => {
  test.setTimeout(90000);
  const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
  for (const route of routes) {
    await open(page, route);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    expect(violations, route).toEqual([]);
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['quadros-eletricos', 'orcamento']) {
      await open(page, route);
      if (route === 'quadros-eletricos') await page.locator('.cbe-flip-cue').first().click();
      else await page.locator('[data-flow=guiado]').click();
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      expect(violations, `${route} estado alternativo ${width}`).toEqual([]);
    }
  }
});
