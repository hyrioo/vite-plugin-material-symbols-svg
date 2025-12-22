import {
    type SymbolKey,
    type SymbolSvg,
    type Theme,
    type OpticalSize,
    type IconConfig,
    type DefineCustomMap,
    type DefinedIcons
} from './types';

export function keyOf(k: SymbolKey): string {
    return `${k.theme}::${k.icon}::${k.filled}::${k.weight}`;
}

export function customKeyOf(k: Pick<SymbolKey, 'icon'>): string {
    return `custom::${k.icon}`;
}

export function parseSvg(svg: string): SymbolSvg | null {
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
    // Matches everything between the first > and the last </svg>
    const contentMatch = svg.match(/>([\s\S]*?)<\/svg>/i);

    if (!viewBoxMatch || !contentMatch) return null;

    return {
        viewBox: viewBoxMatch[1],
        content: contentMatch[1].trim()
    };
}

export function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

export function normalizeNums(input: readonly unknown[] | undefined, fallback: readonly number[]): number[] {
    const src = input && input.length ? input : fallback;
    return unique(Array.from(src as readonly unknown[])
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n))) as number[];
}

export function normalizeFills(input: readonly (boolean | 0 | 1)[] | undefined, fallback: readonly (0 | 1)[]): (0 | 1)[] {
    const src = input && input.length ? input : fallback;
    const arr = Array.from(src).map((v) => {
        if (v === true) return 1;
        if (v === false) return 0;
        const n = Number(v);
        return n === 1 ? 1 : 0;
    }) as (0 | 1)[];
    return unique(arr) as (0 | 1)[];
}

export function normalizeThemes(input: readonly unknown[] | undefined, fallback: readonly Theme[]): Theme[] {
    const src = input && input.length ? input : fallback;
    const allowed: Theme[] = ['rounded', 'outlined', 'sharp'];
    const arr = Array.from(src as readonly unknown[])
        .map((t) => String(t).toLowerCase() as Theme)
        .filter((t) => allowed.includes(t));
    return unique(arr);
}