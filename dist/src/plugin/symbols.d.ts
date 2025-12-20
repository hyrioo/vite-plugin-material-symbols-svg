export type Theme = 'rounded' | 'outlined' | 'sharp';
export declare function axesString(weight: number, fill: 0 | 1): string;
export declare function buildSymbolUrl(theme: Theme, icon: string, axes: string, size: number): string;
export declare function toFilename(icon: string, fill: 0 | 1, weight: number, size: number): string;
export declare function withConcurrency<T, R>(items: T[], limit: number, worker: (item: T, i: number) => Promise<R>): Promise<R[]>;
export declare function downloadSymbols(tasks: {
    url: string;
    file: string;
}[], concurrency: number, logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
}): Promise<{
    saved: number;
    skipped: number;
    failed: number;
}>;
