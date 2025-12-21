export declare const isProduction: boolean;
export interface SymbolConfig {
    debug: boolean;
}
export declare function configureSymbolConfig(overrides: Partial<SymbolConfig>): void;
export declare const symbolConfig: SymbolConfig;
