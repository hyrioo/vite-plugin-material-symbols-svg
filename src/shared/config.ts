import { readonly } from 'vue';

export interface SymbolConfig {
    debug: boolean;
}

let _config: SymbolConfig = {
    debug: (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'),
};
console.log('vite-plugin-material-symbols-svg debug:', _config.debug);

export function configureSymbolConfig(overrides: Partial<SymbolConfig>) {
    _config = {
        ..._config,
        ...overrides,
    };
}

export const symbolConfig: SymbolConfig = readonly({
    get debug() {
        return _config.debug;
    },
});
