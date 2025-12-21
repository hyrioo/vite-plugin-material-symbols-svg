
export interface SymbolConfig {
    debug: boolean;
}

let _config: SymbolConfig = {
    debug: (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'),
};

export function configureSymbolConfig(overrides: Partial<SymbolConfig>) {
    _config = {
        ..._config,
        ...overrides,
    };
}

export const symbolConfig: SymbolConfig = {
    get debug() {
        return _config.debug;
    },
};
