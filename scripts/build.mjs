import fs from 'node:fs/promises';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
const source = await fs.readFile('css/tailwind.css', 'utf8');
const result = await postcss([tailwind()]).process(source, { from: 'css/tailwind.css', to: 'css/generated.css' });
await fs.writeFile('css/generated.css', result.css);
console.log('Built css/generated.css');
