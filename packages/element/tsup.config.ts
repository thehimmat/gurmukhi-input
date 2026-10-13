import { defineConfig } from 'tsup';

export default defineConfig([
  // npm: core stays an external dependency
  {
    entry: ['src/index.ts', 'src/define.ts'],
    format: ['esm', 'cjs'],
    dts: true,
  },
  // CDN: one self-registering ES module with core bundled in, for
  // <script type="module" src="https://cdn.jsdelivr.net/npm/@atthebunga/gurmukhi-element@x.y.z">
  {
    entry: { cdn: 'src/define.ts' },
    format: ['esm'],
    outExtension: () => ({ js: '.js' }),
    noExternal: [/.*/],
    minify: true,
    target: 'es2020',
  },
]);
