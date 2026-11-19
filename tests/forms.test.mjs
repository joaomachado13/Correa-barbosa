import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPhone, buildWhatsAppMessage, createWhatsAppURL } from '../js/forms.js';

test('telefone aceita DDD/formatação e rejeita letras e números incompletos', () => {
  for (const value of ['(34) 99922-7667', '+55 34 99922-7667', '3432373013']) assert.ok(isValidPhone(value));
  for (const value of ['abc', '123', '99922-7667', '34 99922-7667<script>', '+1234567890123456']) assert.equal(isValidPhone(value), false);
});
test('mensagem preserva acentos e parâmetros técnicos; campos opcionais vazios são omitidos', () => {
  const message = buildWhatsAppMessage([{ label: 'Nome', value: ' José ' }, { label: 'Empresa', value: ' ' }, { label: 'Detalhes', value: '380V / 50 kVA & proteção IP65' }], 'um orçamento técnico');
  assert.match(message, /Nome: José/);
  assert.doesNotMatch(message, /Empresa:/);
  const url = new URL(createWhatsAppURL(message));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5534999227667');
  assert.equal(url.searchParams.get('text'), message);
});
