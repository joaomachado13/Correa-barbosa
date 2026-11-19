import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ reducedMotion: 'reduce' });
const published = JSON.parse(readFileSync('assets/data/frentes.json', 'utf8')).frentes.filter(front => front.status === 'publicada');

test('home destaca as frentes ativas na entrada e leva às páginas específicas', async ({ page }) => {
  for (const width of [1440, 901, 390, 320]) {
    await page.setViewportSize({ width, height: width > 760 ? 1000 : 844 });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('distribuição à geração');
    await expect(page.locator('[data-home-front]')).toHaveCount(published.length);
    for (const { id } of published.slice(0, 2)) {
      const card = page.locator(`[data-home-front="${id}"]`);
      await expect(card).toBeVisible();
      expect(await card.locator('h2').evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })).toBe(true);
    }
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await page.locator('[data-home-front="energia-fotovoltaica"]').click();
  await expect(page.locator('h1')).toContainText('Painéis solares');
  await expect(page.locator('.drawer-quote-btn')).toHaveAttribute('href', '#analise-solar');
  await page.locator('.brand-logo').click();
  await expect(page.locator('.drawer-quote-btn')).toHaveAttribute('href', '#orcamento');
  await page.locator('[data-home-front="quadros-eletricos"]').click();
  await expect(page.locator('h1')).toHaveText('Quadros elétricos sob medida');
  await expect(page.locator('.drawer-quote-btn')).toHaveAttribute('href', 'orcamento.html');
  await expect(page.locator('.service-faq')).toBeVisible();
});

test('contato da home aceita orientação geral, preserva dados e funciona com texto ampliado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.locator('#nome_cta').fill('Teste da home');
  await page.locator('#tel_cta').fill('34999227667');
  await page.locator('#home_frente').selectOption('orientacao');
  await page.locator('#desc_cta').fill('Preciso entender as opções para a minha instalação.');
  await page.locator('.home-contact-form [type=submit]').click();
  await expect(page.locator('.home-contact-form [role=status]')).toContainText('ainda não foi enviada');
  const link = page.locator('.home-contact-form .whatsapp-continue');
  const url = new URL(await link.getAttribute('href'));
  expect(url.searchParams.get('text')).toContain('Quero orientação da equipe');
  expect(url.searchParams.get('text')).toContain('projeto de engenharia elétrica');
  await page.locator('#desc_cta').fill('Também quero conhecer energia solar.');
  await expect(link).not.toHaveAttribute('href');
  await expect(page.locator('#nome_cta')).toHaveValue('Teste da home');
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('menu reconhece a página ativa quando a hospedagem simplifica URLs e links', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const simplify = path => path.replace(/index\.html$/, '').replace(/\.html$/, '');
      history.replaceState({}, '', simplify(location.pathname));
      document.querySelectorAll('.nav-link').forEach(link => { link.href = simplify(new URL(link.href).pathname); });
    }, { once: true });
  });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  const home = page.locator('.nav-link').filter({ hasText: 'Início' });
  await expect(home).toHaveClass(/active/);
  await expect(home).toHaveAttribute('aria-current', 'page');
  await page.goto('/energia-fotovoltaica.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.nav-link').filter({ hasText: 'Áreas de atuação' })).toHaveClass(/active/);
  await expect(home).not.toHaveClass(/active/);
});
