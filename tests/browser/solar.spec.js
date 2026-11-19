import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ reducedMotion: 'reduce' });

test('energia solar é acessível pelas áreas e prepara um pedido específico sem enviar dados', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/solucoes.html', { waitUntil: 'networkidle' });
  await page.locator('[data-front="energia-fotovoltaica"] a').click();
  await expect(page.locator('h1')).toContainText('Painéis solares');
  await expect(page.locator('#main-nav-menu a[href="solucoes.html"]')).toHaveClass(/active/);
  await expect(page.locator('.nav-actions > a.cbe-btn')).toHaveAttribute('href', '#analise-solar');
  expect(await page.locator('.solar-hero').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(19, 34, 68)');
  await expect(page.locator('[data-solar-case]')).toHaveCount(6);
  await page.getByRole('link', { name: 'Solicitar análise do meu projeto' }).click();
  const form = page.locator('#solar-form');
  await page.locator('#solar_nome').fill('Maria & João');
  await page.locator('#solar_telefone').fill('abc');
  await page.locator('#solar_cidade').fill('Uberlândia/MG');
  await page.locator('#solar_imovel').selectOption('empresa');
  await form.locator('[type=submit]').click();
  expect(await page.locator('#solar_telefone').evaluate(el => el.checkValidity())).toBe(false);
  await expect(form.locator('.form-feedback')).toBeHidden();
  await page.locator('#solar_telefone').fill('(34) 99922-7667');
  // Consumption is optional: the initial contact must work before the visitor has a bill.
  const requests = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:8010')) requests.push(request.url()); });
  await form.locator('[type=submit]').click();
  await expect(form.getByRole('status')).toContainText('ainda não foi enviada');
  const link = form.locator('.whatsapp-continue');
  await expect(link).toBeFocused();
  const url = new URL(await link.getAttribute('href'));
  expect(url.pathname).toBe('/5534999227667');
  expect(url.searchParams.get('text')).toContain('energia solar fotovoltaica');
  expect(url.searchParams.get('text')).toContain('Maria & João');
  expect(url.searchParams.get('text')).toContain('Empresa / comércio');
  await expect(page.locator('#solar_nome')).toHaveValue('Maria & João');
  await page.locator('#solar_consumo').fill('850');
  await expect(form.locator('.form-feedback')).toBeHidden();
  await expect(link).not.toHaveAttribute('href');
  await form.locator('[type=submit]').click();
  expect(new URL(await link.getAttribute('href')).searchParams.get('text')).toContain('Consumo mensal (kWh): 850');
  expect(requests).toEqual([]);
  await page.locator('#main-nav-menu a[href="index.html"]').click();
  await page.locator('[data-home-front="quadros-eletricos"]').click();
  await expect(page.locator('.nav-actions > a.cbe-btn')).toHaveAttribute('href', 'orcamento.html');
  await page.locator('#main-nav-menu a[href="solucoes.html"]').click();
  await page.locator('[data-front="energia-fotovoltaica"] a').click();
  await expect(page.locator('#solar-form button[type=submit]')).toBeEnabled();
  await expect(page.locator('.nav-actions > a.cbe-btn')).toHaveAttribute('href', '#analise-solar');
  expect(errors).toEqual([]);
});

test('solar funciona sem JS, com fotos locais e contato alternativo', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/energia-fotovoltaica.html');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.nav-actions > a.cbe-btn')).toHaveAttribute('href', '#analise-solar');
  await expect(page.locator('[data-solar-case]')).toHaveCount(6);
  for (const image of await page.locator('[data-solar-case] img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth === Number(el.getAttribute('width')) && el.naturalHeight === Number(el.getAttribute('height')))).toBe(true);
  }
  const faq = page.locator('.solar-faq details').first();
  await faq.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(faq).toHaveAttribute('open', '');
  await expect(faq.locator('p')).toBeVisible();
  await expect(page.locator('#solar-form noscript a')).toHaveAttribute('href', 'https://wa.me/5534999227667');
  await context.close();
});

test('solar mantém foco, leitura e contraste em desktop e mobile, inclusive após preparar a mensagem', async ({ page }) => {
  const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/energia-fotovoltaica.html', { waitUntil: 'networkidle' });
    const faq = page.locator('.solar-faq details').first();
    await faq.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
    await page.locator('#solar_nome').fill('Teste');
    await page.locator('#solar_telefone').fill('34999227667');
    await page.locator('#solar_cidade').fill('Prata/MG');
    await page.locator('#solar_imovel').selectOption('residencia');
    await page.locator('#solar-form [type=submit]').click();
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
    expect(violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});
