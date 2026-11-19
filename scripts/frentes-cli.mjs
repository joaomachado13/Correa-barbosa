import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateFronts } from './frentes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const filename = path.join(root, 'assets/data/frentes.json');
const registry = JSON.parse(await readFile(filename, 'utf8'));
const [command = 'validar', id, ...words] = process.argv.slice(2);
if (command === 'criar') {
  if (!id || !words.length) throw new Error('Uso: npm run frente:criar -- slug "Nome da frente"');
  registry.frentes.push({ id, nome: words.join(' '), status: 'rascunho', tipo: 'servico', pagina: `${id}.html`, resumo: '', introducao: '', imagem: null, grupos: [], origens: [] });
  validateFronts(registry, root);
  await writeFile(filename, JSON.stringify(registry, null, 2) + '\n');
  console.log(`Rascunho ${id} cadastrado. Edite assets/data/frentes.json e use npm run dev:rascunhos.`);
} else if (command === 'validar') {
  const fronts = validateFronts(registry, root);
  for (const front of fronts) console.log(`${front.status.padEnd(10)} ${front.id}${!front.imagem ? ' — fotografia ainda não definida' : ''}`);
} else {
  throw new Error('Comando desconhecido. Use validar ou criar.');
}
