import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ reducedMotion: 'reduce' });
const fronts = JSON.parse(readFileSync('assets/data/frentes.json', 'utf8')).frentes;

test('áreas de atuação públicas exibem apenas frentes publicadas, inclusive sem JS', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/solucoes.html');
  await expect(page.locator('h1')).toHaveText('Áreas de atuação');
  await expect(page.locator('[data-front]')).toHaveCount(fronts.filter(front => front.status === 'publicada').length);
  await expect(page.locator('[data-front=quadros-eletricos] a')).toHaveAttribute('href', 'quadros-eletricos.html');
  for (const front of fronts.filter(front => front.status === 'rascunho')) await expect(page.locator(`[data-front="${front.id}"]`)).toHaveCount(0);
  await context.close();
});

test('rascunhos podem ser inspecionados em mobile e sua área segue na mensagem de contato', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8012/solucoes.html', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-front]')).toHaveCount(fronts.length);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.locator('[data-front=projetos-e-laudos] a').click();
  await expect(page.locator('h1')).toHaveText('Projetos e laudos');
  await expect(page.locator('.area-preview-note')).toBeVisible();
  await expect(page.locator('#main-nav-menu a[href="solucoes.html"]')).toHaveClass(/active/);
  await page.locator('.area-row a.cbe-btn').click();
  await expect(page.locator('#ct_frente')).toHaveValue('projetos-e-laudos');
  await expect(page.locator('#ct_assunto')).toHaveValue('outro');
  for (const [id, value] of Object.entries({ ct_nome: 'Teste da frente', ct_email: 'teste@example.com', ct_telefone: '34999227667', ct_mensagem: 'Revisar instalações elétricas' })) await page.locator(`#${id}`).fill(value);
  await page.locator('form button[type=submit]').click();
  const url = new URL(await page.locator('.whatsapp-continue').getAttribute('href'));
  expect(url.searchParams.get('text')).toContain('Área de atuação: Projetos e laudos');
  expect(errors).toEqual([]);
});

test('páginas de serviço compartilham layout, respeitam a tela e passam nas verificações axe', async ({ page }) => {
  test.setTimeout(60000);
  const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://127.0.0.1:8012/projetos-e-laudos.html', { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.area-groups h2')).toHaveCount(2);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    expect(violations).toEqual([]);
  }
});
