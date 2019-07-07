import { SourceResolver } from '../source/sourceResolver';
import { PackageDefinitionSummary } from './packageDefinition';
export declare abstract class DefinitionResolver {
    source: SourceResolver;
    constructor(source: SourceResolver);
    abstract getPackageDefinition(hash?: string): Promise<PackageDefinitionSummary>;
    getDefinitionPath(): string;
}
