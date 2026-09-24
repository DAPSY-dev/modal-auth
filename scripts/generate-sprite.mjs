import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const source = new URL('../src/assets/icons/', import.meta.url);
const destination = new URL('../public/icons.svg', import.meta.url);
const files = (await readdir(source)).filter((file) => file.endsWith('.svg')).sort();
const symbols = [];

for (const file of files) {
  const id = file.slice(0, -4);
  if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`Use lowercase kebab-case SVG filenames: ${file}`);
  const dom = new JSDOM(await readFile(new URL(file, source), 'utf8'), { contentType: 'image/svg+xml' });
  try {
    const svg = dom.window.document.documentElement;
    if (svg.localName !== 'svg') throw new Error(`${file}: expected an SVG root`);
    const viewBox = svg.getAttribute('viewBox');
    if (!viewBox) throw new Error(`${file}: a viewBox is required for scaling`);
    // Root dimensions control display size; shape dimensions define geometry.
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.removeAttribute('fill');
    for (const element of [svg, ...svg.querySelectorAll('*')]) {
      if (element.hasAttribute('style') || element.localName === 'style') {
        throw new Error(`${file}: use SVG presentation attributes instead of embedded CSS`);
      }
      if (element.getAttribute('fill') !== 'none') element.removeAttribute('fill');
      if (element.hasAttribute('stroke') && element.getAttribute('stroke') !== 'none') element.setAttribute('stroke', 'currentColor');
    }
    // Namespace internal references so gradients, masks, and clips cannot collide.
    const ids = new Map([...svg.querySelectorAll('[id]')].map((node) => [node.id, `icon-${id}-${node.id}`]));
    for (const element of [svg, ...svg.querySelectorAll('*')]) {
      for (const attribute of [...element.attributes]) {
        let value = attribute.value.replace(/url\(#([^)]*)\)/g, (match, ref) => ids.has(ref) ? `url(#${ids.get(ref)})` : match);
        if (attribute.localName === 'href' && value.startsWith('#') && ids.has(value.slice(1))) value = `#${ids.get(value.slice(1))}`;
        if (attribute.name === 'id' && ids.has(value)) value = ids.get(value);
        element.setAttribute(attribute.name, value);
      }
    }
    const symbol = dom.window.document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    for (const attribute of [...svg.attributes]) {
      if (!['xmlns', 'id'].includes(attribute.name)) symbol.setAttribute(attribute.name, attribute.value);
    }
    symbol.setAttribute('id', `icon-${id}`);
    symbol.append(...svg.childNodes);
    symbols.push(symbol.outerHTML);
  } finally { dom.window.close(); }
}

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(destination, `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`);
console.log(`Generated ${fileURLToPath(destination)} with ${symbols.length} icons.`);
