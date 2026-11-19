import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = {
  'gsap/dist/gsap.min.js': 'gsap.min.js',
  'gsap/dist/ScrollTrigger.min.js': 'ScrollTrigger.min.js',
  'lenis/dist/lenis.min.js': 'lenis.min.js',
  'swup/dist/Swup.umd.js': 'swup.min.js'
};
await mkdir(path.join(root, 'assets/vendor'), { recursive: true });
for (const [source, target] of Object.entries(files)) {
  await copyFile(path.join(root, 'node_modules', source), path.join(root, 'assets/vendor', target));
}
await mkdir(path.join(root, 'assets/fonts'), { recursive: true });
for (const family of ['inter', 'space-grotesk', 'jetbrains-mono']) {
  const source = path.join(root, 'node_modules/@fontsource-variable', family);
  await copyFile(path.join(source, 'files', `${family}-latin-wght-normal.woff2`), path.join(root, 'assets/fonts', `${family}.woff2`));
  await copyFile(path.join(source, 'LICENSE'), path.join(root, 'assets/fonts', `${family}-LICENSE.txt`));
}
for (const [name, license] of [['gsap', 'README.md'], ['lenis', 'LICENSE'], ['swup', 'LICENSE']]) {
  await copyFile(path.join(root, 'node_modules', name, license), path.join(root, 'assets/vendor', `${name}-LICENSE.txt`));
}
console.log('Bibliotecas e fontes locais preparadas com as versões do lockfile.');
