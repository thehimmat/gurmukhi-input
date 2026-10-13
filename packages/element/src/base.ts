// HTMLElement doesn't exist during server rendering (Next.js, Nuxt, SvelteKit).
// Extending a stand-in lets the module load there; elements only register in
// the browser (see defineGurmukhiElements).
export const BaseElement: typeof HTMLElement =
  typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;
