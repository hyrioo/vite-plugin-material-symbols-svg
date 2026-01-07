import { readonly } from 'vue';

export const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'production';

export interface SymbolConfig {
    debug: boolean;
}

let _config: SymbolConfig = {
    debug: isProduction,
};

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
