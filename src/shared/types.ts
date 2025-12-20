export type OpticalSize = 20 | 24 | 40 | 48;
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type Fill = boolean;
export type Theme = 'rounded' | 'outlined' | 'sharp';

export interface SymbolKey {
    icon: string;
    theme: Theme;
    fill: 0 | 1;
    weight: number;
    size: number; // optical size in px
}

export interface SymbolSvg {
    d: string;
    viewBox: string;
}

export type IconConfig = {
    sizes: readonly OpticalSize[];
    weights?: readonly Weight[];
    fills?: readonly Fill[];
    themes?: readonly Theme[];
};

export type DefinedIcons = {
    Symbols: Record<string, IconConfig>;
    Custom?: Record<string, any>;
    Default?: Partial<IconConfig>;
};


// defineIcons helper to create strongly typed maps
// A map of custom icons where each icon may specify any subset of optical sizes
// Example: { spark: { 24: svg24 }, brand: { 20: svg20, 40: svg40 } }
export type DefineCustomMap = Record<
    string,
    Partial<Readonly<Record<OpticalSize, unknown | Promise<{ default: string }> | { default: string }>>>
>;
