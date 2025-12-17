// Placeholder type augmentation for consumers. This file is included in the
// published dist as dist/icons.d.ts and will be overwritten at dev time by
// the plugin with a generated list of icon names.
//
// Having this file ensures a stable module path for declaration merging so
// TypeScript can always find the augmentation next to dist/index.d.ts.

declare module '@hyrioo/vite-plugin-material-symbols-svg' {
  // Intentionally empty; dev server will augment with actual icon keys
  export interface __MaterialSymbolIconIndex {}
}

export {};
