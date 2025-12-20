import type { PluginContext } from 'rollup';
export interface MetaOptions {
    strict?: boolean;
}
export declare function fetchVersions(ctx: PluginContext, versionsFile: string, iconsTsFile: string, options: MetaOptions): Promise<void>;
